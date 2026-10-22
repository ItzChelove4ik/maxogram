<script>
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    set as sessionSet,
    get as sessionGet
  } from "$lib/stores/session.js";
  import { registerBackHandler } from "$lib/utils/backButton.js";

  import BackButton from "$components/main/auth/BackButton.svelte";
  import ActionButton from "$components/main/auth/ActionButton.svelte";

  import API from "$lib/stores/api";
  import { parseApiError } from "$lib/api/MobileApi.js";

  let error = "";
  let infoMessage = "";
  let code = "";
  let loading = false;
  let resending = false;

  const phone = sessionGet("phone") || "";
  const initialDelay = sessionGet("codeDelay");
  let timerSeconds = typeof initialDelay === "number" && initialDelay > 0 ? initialDelay : 60;
  let timerInterval = null;

  const name = sessionGet("name");
  const state = !name ? "login" : "register";

  const authPayload = sessionGet("authPayload") || {};
  const serverCodeLength = sessionGet("codeLength") || authPayload.codeLength;
  const codeLength = typeof serverCodeLength === "number" && serverCodeLength > 0 ? serverCodeLength : 6;

  function detectCallVerification(auth, phoneNumber) {
    console.log(auth);
    if (auth.requestType?.includes("CALL")) return true;

    // TODO ???
    const clean = (phoneNumber || "").replace(/[^\d+]/g, "");
    if (clean.startsWith("+374") || clean.startsWith("374")) {
      return true;
    }

    return false;
  }

  let isCall = detectCallVerification(authPayload, phone);

  $: subtitleText = isCall
    ? `Вам поступит звонок-сброс. Введите последние ${codeLength} цифр номера входящего вызова.`
    : "Код подтверждения отправлен по SMS или в MAX на другом устройстве.";

  $: placeholderText = isCall
    ? `Последние ${codeLength} цифр`
    : "•".repeat(codeLength);

  $: resendButtonText = isCall
    ? "Запросить повторный звонок"
    : "Отправить код по SMS";

  function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds -= 1;
      } else {
        stopTimer();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  onMount(() => {
    startTimer();
  });

  const unregisterBack = registerBackHandler(() => {
    goto("/auth/" + state);
  });

  onDestroy(() => {
    stopTimer();
    unregisterBack();
  });

  async function resendCode() {
    if (resending || timerSeconds > 0) return;
    if (!phone) {
      error = "Номер телефона не найден";
      return;
    }

    resending = true;
    error = "";
    infoMessage = "";

    try {
      const response = await $API.resendAuth(phone);
      if (response?.error) {
        error = parseApiError(response);
      } else {
        sessionSet("authPayload", response);
        isCall = detectCallVerification(response, phone);
        infoMessage = isCall
          ? "Ожидайте повторный звонок"
          : "Код отправлен по SMS";
        timerSeconds = response?.codeDelay || 60;
        startTimer();
      }
    } catch (e) {
      error = parseApiError(e);
    } finally {
      resending = false;
    }
  }

  async function verify() {
    if (loading) return;
    if (code.length !== codeLength) {
      error = `Длина кода — ${codeLength} символов!`;
      return;
    }

    error = "";
    infoMessage = "";
    loading = true;

    try {
      const response = await $API.checkCode(code);

      if (response?.error) {
        error = parseApiError(response);
        loading = false;
        return;
      }

      if (response?.passwordChallenge) {
        sessionSet("challenge", response.passwordChallenge);
        loading = false;
        goto("/auth/password");
        return;
      }

      const isRegistration = response?.tokenAttrs?.REGISTER && !response?.tokenAttrs?.LOGIN;
      if (isRegistration) {
        const registerToken = response?.tokenAttrs?.REGISTER?.token;
        if (!name) {
          sessionSet("registerToken", registerToken);
          loading = false;
          goto("/auth/register");
          return;
        }

        const regResponse = await $API.submitRegister(name);
        if (regResponse?.error) {
          error = parseApiError(regResponse);
          loading = false;
          return;
        }

        loading = false;
        goto("/");
        return;
      }

      await $API.handleLoginResponse(response);
      loading = false;
      goto("/");
    } catch (e) {
      loading = false;
      error = parseApiError(e);
    }
  }

  function onInput(e) {
    error = "";
    code = e.target.value.trim();
    if (code.length === codeLength) {
      verify();
    }
  }
</script>

<div class="auth-page">
  <h1>Подтверждение</h1>
  {#if phone}
    <div class="phone-badge">{phone}</div>
  {/if}
  <p class="subtitle">
    {subtitleText}
  </p>
  <div class="form">
    {#if error}
      <div class="error" role="alert">{error}</div>
    {/if}
    {#if infoMessage}
      <div class="info">{infoMessage}</div>
    {/if}
    <input
      type="text"
      inputmode="numeric"
      aria-label="Код подтверждения"
      autocomplete="one-time-code"
      maxlength={codeLength}
      value={code}
      on:input={onInput}
      placeholder={placeholderText}
      required
    />
    <ActionButton text="Подтвердить" action={verify}/>

    <div class="resend-container">
      {#if timerSeconds > 0}
        <span class="timer-label">Отправить повторно через {timerSeconds} сек</span>
      {:else}
        <button
          type="button"
          class="resend-action"
          on:click={resendCode}
          disabled={resending}
        >
          {resending ? "Отправка..." : resendButtonText}
        </button>
      {/if}
    </div>
  </div>
  <BackButton/>
</div>

<style>

  .auth-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;
    color: var(--text-primary);
    max-width: min(340px, 92%);
    margin: 0 auto;

    box-sizing: border-box;

    min-height: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 32px 24px calc(32px + var(--safe-area-bottom));
    background: var(--bg-app);
  }

  .auth-page h1 {


    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -.03em;
    margin: 16px 0 8px;
  }

  .phone-badge {
    margin-top: 8px;
    font-size: 0.9412rem;
    font-weight: 500;
    color: var(--accent-primary);
    letter-spacing: 0.5px;
  }

  .subtitle {
    margin: 10px 0 12px 0;
    font-size: 0.7941rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .form {
    display: flex;
    flex-direction: column;



    max-width: 360px;
    width: 100%;
    gap: 12px;
    margin-top: 24px;
  }

  input {
    outline: none;
    text-align: center;
    letter-spacing: 4px;
    font-weight: 600;

    border: 1px solid var(--border-card);
    background: var(--bg-surface);
    background-color: var(--bg-surface);
    border-radius: 14px;
    min-height: 52px;
    padding: 14px 16px;
    font-size: 1rem;
    color: var(--text-primary);
  }

  input:focus {
    border-color: var(--accent-primary);
  }

  .resend-container {
    margin-top: 6px;
    min-height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .timer-label {
    font-size: 0.7941rem;
    color: var(--text-muted);
  }

  .resend-action {
    background: transparent;
    border: none;
    color: var(--accent-primary);
    font-size: 0.8235rem;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    padding: 4px 8px;
    transition: color 0.15s, opacity 0.15s;
  }

  .resend-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .resend-action:hover:not(:disabled) {
    color: var(--accent-primary);
  }

  .error {
    color: var(--status-danger);
    font-size: 0.7941rem;
    min-height: 18px;
    word-break: break-word;
  }

  .info {
    color: var(--status-success);
    font-size: 0.7941rem;
    min-height: 18px;
    word-break: break-word;
  }
</style>

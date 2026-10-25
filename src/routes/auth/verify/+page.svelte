<script>
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    set as sessionSet,
    get as sessionGet
  } from "$lib/stores/session.js";
  import { registerBackHandler } from "$lib/utils/backButton.js";

  import AuthShell from "$components/main/auth/AuthShell.svelte";
  import SubmitButton from "$components/main/auth/SubmitButton.svelte";

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
      error = `Введите все ${codeLength} цифр кода подтверждения.`;
      document.getElementById("verify-code")?.focus();
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
    code = e.target.value.replace(/\D/g, "").slice(0, codeLength);
    e.target.value = code;
    if (code.length === codeLength) {
      verify();
    }
  }
</script>

<AuthShell title={isCall ? 'Ожидайте звонок' : 'Проверьте сообщения'} description={subtitleText} icon={isCall ? 'calls' : 'chats'} backHref={'/auth/' + state} backLabel="Изменить номер">
  <form class="auth-form" on:submit|preventDefault={verify} novalidate>
    {#if phone}<p class="auth-phone">{phone}</p>{/if}
    <div class="auth-field">
      <label for="verify-code">{isCall ? 'Последние цифры номера' : 'Код подтверждения'}</label>
      <input class="auth-input auth-code" id="verify-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength={codeLength} value={code} on:input={onInput} placeholder={placeholderText} required aria-invalid={!!error} aria-describedby={error ? 'verify-error' : 'verify-hint'} />
      {#if error}<p class="auth-error" id="verify-error" role="alert">{error}</p>
      {:else}<p class="auth-field-hint" id="verify-hint">{codeLength} цифр · можно вставить код целиком</p>{/if}
    </div>
    {#if infoMessage}<p class="auth-info" role="status">{infoMessage}</p>{/if}
    <SubmitButton text="Подтвердить" busy={loading} busyText="Проверяем код…" />
    {#if timerSeconds > 0}
      <span class="auth-timer">Повторный запрос через {timerSeconds} сек</span>
    {:else}
      <button type="button" class="auth-text-action" on:click={resendCode} disabled={resending || loading} aria-busy={resending}>{resending ? 'Отправляем…' : resendButtonText}</button>
    {/if}
  </form>
</AuthShell>

<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    set as sessionSet,
    get as sessionGet
  } from "$lib/stores/session.js";
  import API from "$lib/stores/api";
  import { getDevice } from "$lib/stores/accounts";

  import OpenDevSettingsButton from "$components/main/dev/OpenButton.svelte";
  import OpenDevicesButton from "$components/main/devices/OpenButton.svelte";
  import ActionButton from "$components/main/auth/ActionButton.svelte";

  let error = "";
  let phone = sessionGet("phone") || "";
  let name = sessionGet("name") || "";
  const existingRegisterToken = sessionGet("registerToken");

  onMount(async () => {
    if (!sessionGet("device")) {
      const dev = await getDevice();
      if (dev) sessionSet("device", dev);
    }
  });

  async function completeExistingRegistration() {
    if (!name.trim()) {
      error = "Введите псевдоним!";
      return;
    }

    if (!sessionGet("device")) {
      const dev = await getDevice();
      if (dev) {
        sessionSet("device", dev);
      } else {
        return alert("Нажмите на иконку телефона, чтобы настроить данные входа!");
      }
    }

    error = "";
    try {
      const regResponse = await $API.submitRegister(name.trim());
      if (regResponse?.error) {
        error = regResponse.title || regResponse.message || "Ошибка регистрации";
        return;
      }
      sessionSet("registerToken", null);
      goto("/");
    } catch (e) {
      error = e?.message || "Ошибка регистрации";
    }
  }

  async function register() {
    if (phone.length < 7) {
      error = "Это не номер!";
      return;
    }

    if (!sessionGet("device")) {
      const dev = await getDevice();
      if (dev) {
        sessionSet("device", dev);
      } else {
        return alert("Нажмите на иконку телефона, чтобы настроить данные входа!");
      }
    }

    error = "";
    if (!phone.startsWith("+")) phone = "+" + phone;

    sessionSet("phone", phone);
    sessionSet("name", name);

    const response = await $API.startAuth(phone);

    if (!response?.success) {
      error = response?.title || response?.message || "Ошибка отправки кода";
    } else {
      if (response.codeDelay) sessionSet("codeDelay", response.codeDelay);
      if (response.codeLength) sessionSet("codeLength", response.codeLength);
      sessionSet("authPayload", response);
      goto("/auth/verify");
    }
  }
</script>

<div class="auth-page">
  <h1>Регистрация</h1>
  <div class="form">
    <div class="error" role="alert">{error}</div>
    <input
      type="text"
      bind:value={name}
      placeholder="Псевдоним"
      aria-label="Псевдоним"
      autocomplete="nickname"
      required
    />
    {#if !existingRegisterToken}
      <input
        type="tel"
        bind:value={phone}
        placeholder="Номер телефона"
        aria-label="Номер телефона"
        autocomplete="tel"
        required
      />
      <ActionButton text="Получить код" action={register}/>
    {:else}
      <ActionButton text="Завершить регистрацию" action={completeExistingRegistration}/>
    {/if}
  </div>
  <a href="/auth/login" class="link">Уже есть аккаунт? <u>Войти</u></a>
</div>

<OpenDevSettingsButton />
<OpenDevicesButton />

<style>

  .auth-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;
    color: var(--text-primary);

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

    border: 1px solid var(--border-card);
    background: var(--bg-surface);
    background-color: var(--bg-surface);
    border-radius: 14px;
    min-height: 52px;
    padding: 14px 16px;
    font-size: 1rem;
    color: var(--text-primary);
  }

  .link {
    margin-top: 20px;
    font-size: 0.8824rem;
    color: var(--accent-primary);
    text-decoration: none;
    transition: transform 0.2s;
  }

  .link:hover {
    transform: scale(1.02);
  }

  .error {
    color: red;
    font-size: 0.8824rem;
    height: 22px;
    word-break: break-all;
  }
</style>

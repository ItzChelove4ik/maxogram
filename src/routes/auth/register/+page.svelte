<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    set as sessionSet,
    get as sessionGet
  } from "$lib/stores/session.js";
  import API from "$lib/stores/api";
  import { getDevice } from "$lib/stores/accounts";

  import AuthShell from "$components/main/auth/AuthShell.svelte";
  import SubmitButton from "$components/main/auth/SubmitButton.svelte";
  import Icon from "$components/main/Icon.svelte";
  import { parseApiError } from "$lib/api/MobileApi.js";

  let error = "";
  let errorField = "";
  let busy = false;
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
        error = "Выберите устройство в параметрах подключения внизу экрана.";
        return;
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
    const normalizedPhone = phone.trim().replace(/[\s()-]/g, "");
    if (!/^\+?\d{7,15}$/.test(normalizedPhone)) {
      errorField = "phone";
      error = "Введите номер с кодом страны, например +7 999 123-45-67.";
      document.getElementById("register-phone")?.focus();
      return;
    }

    if (!sessionGet("device")) {
      const dev = await getDevice();
      if (dev) {
        sessionSet("device", dev);
      } else {
        error = "Выберите устройство в параметрах подключения внизу экрана.";
        return;
      }
    }

    error = "";
    phone = normalizedPhone.startsWith("+") ? normalizedPhone : "+" + normalizedPhone;

    sessionSet("phone", phone);
    sessionSet("name", name.trim());

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
  async function submit() {
    if (busy) return;
    error = "";
    errorField = "";
    if (!name.trim()) {
      errorField = "name";
      error = "Введите имя, которое увидят ваши собеседники.";
      document.getElementById("register-name")?.focus();
      return;
    }
    busy = true;
    try {
      if (existingRegisterToken) await completeExistingRegistration();
      else await register();
    } catch (e) { error = parseApiError(e); }
    finally { busy = false; }
  }
</script>

<AuthShell title={existingRegisterToken ? 'Как вас зовут?' : 'Начнём общение'} description={existingRegisterToken ? 'Номер подтверждён. Осталось выбрать имя для вашего профиля.' : 'Создайте аккаунт и оставайтесь рядом с теми, кто важен.'} mode={existingRegisterToken ? '' : 'register'} backHref={existingRegisterToken ? '/auth/login' : ''}>
  <form class="auth-form" on:submit|preventDefault={submit} novalidate>
    <div class="auth-field">
      <label for="register-name">Ваше имя</label>
      <div class="auth-input-wrap">
        <span class="auth-input-icon"><Icon name="user" size={20} /></span>
        <input class="auth-input has-icon" id="register-name" type="text" bind:value={name} placeholder="Как к вам обращаться" autocomplete="nickname" required aria-invalid={errorField === 'name'} aria-describedby={errorField === 'name' ? 'register-name-error' : 'register-name-hint'} />
      </div>
      {#if error && errorField === 'name'}
        <p class="auth-error" id="register-name-error" role="alert">{error}</p>
      {:else}
        <p class="auth-field-hint" id="register-name-hint">Это имя будет видно в вашем профиле</p>
      {/if}
    </div>
    {#if !existingRegisterToken}
      <div class="auth-field">
        <label for="register-phone">Номер телефона</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon"><Icon name="calls" size={20} /></span>
          <input class="auth-input has-icon" id="register-phone" type="tel" inputmode="tel" bind:value={phone} placeholder="+7 999 123-45-67" autocomplete="tel" required aria-invalid={errorField === 'phone'} aria-describedby={errorField === 'phone' ? 'register-phone-error' : 'register-phone-hint'} />
        </div>
        {#if error && errorField === 'phone'}
          <p class="auth-error" id="register-phone-error" role="alert">{error}</p>
        {:else}
          <p class="auth-field-hint" id="register-phone-hint">Укажите номер вместе с кодом страны</p>
        {/if}
      </div>
    {/if}
    {#if error && !errorField}<p class="auth-error auth-error-summary" role="alert">{error}</p>{/if}
    <SubmitButton text={existingRegisterToken ? 'Начать общение' : 'Получить код'} {busy} busyText={existingRegisterToken ? 'Создаём аккаунт…' : 'Отправляем код…'} />
    <p class="auth-form-note">{existingRegisterToken ? 'Вы сможете изменить имя в настройках' : 'Подтвердите номер на следующем шаге'}</p>
  </form>
</AuthShell>

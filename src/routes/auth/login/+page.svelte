<script>
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { goto } from "$app/navigation";

  import {
    getAccounts,
    addAccount,
    setCurrentAccount,
    getDevice,
  } from "$lib/stores/accounts";
  import {
    get as sessionGet,
    set as sessionSet,
  } from "$lib/stores/session.js";
  import API, {
    currentUser
  } from "$lib/stores/api";

  import AuthShell from "$components/main/auth/AuthShell.svelte";
  import SubmitButton from "$components/main/auth/SubmitButton.svelte";
  import Icon from "$components/main/Icon.svelte";
  import { parseApiError } from "$lib/api/MobileApi.js";

  let phone = sessionGet("phone") || "";
  let busy = false;
  let importing = false;
  let hasAccounts = false;
  let errorField = "";
  let error = "";

  onMount(async () => {
    hasAccounts = !!(await getAccounts()).length;
    if (!sessionGet("device")) {
      const dev = await getDevice();
      if (dev) sessionSet("device", dev);
    }
  });

  async function login() {
    const normalizedPhone = phone.trim().replace(/[\s()-]/g, "");
    if (!/^\+?\d{7,15}$/.test(normalizedPhone)) {
      errorField = "phone";
      error = "Введите номер с кодом страны, например +7 999 123-45-67.";
      document.getElementById("login-phone")?.focus();
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
    errorField = "";
    phone = normalizedPhone.startsWith("+") ? normalizedPhone : "+" + normalizedPhone;

    sessionSet("phone", phone);
    sessionSet("name", null);

    const response = await $API.startAuth(phone);

    if (response?.success) {
      if (response.codeDelay) sessionSet("codeDelay", response.codeDelay);
      if (response.codeLength) sessionSet("codeLength", response.codeLength);
      sessionSet("authPayload", response);
      goto("/auth/verify");
    } else {
      error = response?.title || response?.message || "Ошибка входа";
    }
  }

  async function submit() {
    if (busy || importing) return;
    busy = true;
    error = "";
    errorField = "";
    try { await login(); }
    catch (e) { error = parseApiError(e); }
    finally { busy = false; }
  }

  async function handleImport() {
    if (busy || importing) return;
    importing = true;
    error = "";
    errorField = "";
    try { await importAccount(); }
    catch (e) { error = parseApiError(e); }
    finally { importing = false; }
  }

  const readFile = path => invoke("read_file", { path });

  async function importAccount() {
    const select = await invoke("pick", { type: "JSON" }); // TODO implement this type on Rust side

    if (!select) return;

    console.log('Reading file:', select);
    const data = await readFile(select.uri);
    const text = new TextDecoder().decode(new Uint8Array(data));

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      return alert("JSON-файл содержит ошибки!")
    }

    if (!json.version || json.type !== "account") return alert("Неверный файл - это не конфиг аккаунта!");

    if (json.version === 1) {
      const { meta } = json;
      const response = await addAccount(meta.token, meta.device);
      await setCurrentAccount(response.id);
      currentUser.set(undefined);
      goto("/");
    } else {
      return alert("Это конфиг для более новой версии Orbit!")
    }
  }
</script>

<AuthShell title="С возвращением" description="Войдите по номеру телефона, чтобы снова быть на связи." mode="login" backHref={hasAccounts ? '/auth/select' : ''} backLabel="Аккаунты">
  <form class="auth-form" on:submit|preventDefault={submit} novalidate>
    <div class="auth-field">
      <label for="login-phone">Номер телефона</label>
      <div class="auth-input-wrap">
        <span class="auth-input-icon"><Icon name="calls" size={20} /></span>
        <input class="auth-input has-icon" id="login-phone" type="tel" inputmode="tel" bind:value={phone} placeholder="+7 999 123-45-67" autocomplete="tel" required aria-invalid={errorField === 'phone'} aria-describedby={errorField === 'phone' ? 'login-phone-error' : 'login-phone-hint'} />
      </div>
      {#if error && errorField === 'phone'}
        <p class="auth-error" id="login-phone-error" role="alert">{error}</p>
      {:else}
        <p class="auth-field-hint" id="login-phone-hint">Укажите номер вместе с кодом страны</p>
      {/if}
    </div>
    {#if error && !errorField}<p class="auth-error auth-error-summary" role="alert">{error}</p>{/if}
    <SubmitButton text="Получить код" {busy} disabled={importing} busyText="Отправляем код…" />
    <p class="auth-form-note">Отправим код подтверждения по SMS<br />или в MAX на другом устройстве</p>
  </form>
  <svelte:fragment slot="secondary">
    <button class="auth-text-action" type="button" on:click={handleImport} disabled={importing || busy} aria-busy={importing}><Icon name="logout" size={18} />{importing ? 'Импортируем…' : 'Импортировать аккаунт'}</button>
  </svelte:fragment>
</AuthShell>

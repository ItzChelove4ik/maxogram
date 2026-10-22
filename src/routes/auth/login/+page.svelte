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

  import OpenDevSettingsButton from "$components/main/dev/OpenButton.svelte";
  import OpenDevicesButton from "$components/main/devices/OpenButton.svelte";
  import ActionButton from "$components/main/auth/ActionButton.svelte";
  import BackButton from "$components/main/auth/BackButton.svelte";

  let phone = "";
  let error = "";

  onMount(async () => {
    if (!sessionGet("device")) {
      const dev = await getDevice();
      if (dev) sessionSet("device", dev);
    }
  });

  async function login() {
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

  async function showBackButton() {
    return !!(await getAccounts()).length;
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

<div class="auth-page">
  <img class="auth-logo" src="/favicon.png" width="88" height="88" alt="" />
  <h1>Вход в Orbit</h1>
  <p class="auth-description">Введите номер телефона, чтобы продолжить</p>
  <div class="form">
    <div class="error" role="alert">{error}</div>
    <input
      type="tel"
      bind:value={phone}
      placeholder="Номер телефона"
      aria-label="Номер телефона"
      autocomplete="tel"
      required
    />
    <ActionButton text="Получить код" action={login}/>
  </div>
  <a href="/auth/register" class="link">Создать аккаунт</a>
  <a on:click={importAccount} class="link">Импорт аккаунта</a>
  <BackButton condition={showBackButton} path="/auth/select"/>
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
    margin-bottom: 0px;

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
    font-size: 0.8824rem;
    color: var(--accent-primary);
    text-decoration: none;
    transition: transform 0.2s;

    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
  }

  .link:hover {
    transform: scale(1.02);
  }

  .error {
    font-size: 0.8824rem;
    min-height: 18px;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    white-space: normal;
    overflow-wrap: break-word;
    word-break: normal;

    color: var(--status-danger);
  }
  .auth-logo {
    border-radius: 22px;
    margin-bottom: 8px;
  }
  .auth-description {
    font-size: .8824rem;
    color: var(--text-muted);
    max-width: 300px;
    margin: 0;
    line-height: 1.4;
  }
</style>

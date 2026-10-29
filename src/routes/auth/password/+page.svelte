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
  let password = "";
  let showPassword = false;
  let loading = false;
  const challenge = sessionGet("challenge");

  const unregisterBack = registerBackHandler(() => {
    goto("/auth/login");
  });

  onDestroy(() => {
    unregisterBack();
  });

  onMount(() => {
    if (!challenge || !challenge.trackId) {
      goto("/auth/login");
    }
  });

  async function verify() {
    if (loading) return;
    if (!password) {
      error = "Введите пароль для завершения входа.";
      document.getElementById("auth-password")?.focus();
      return;
    }
    if (!challenge?.trackId) {
      goto("/auth/login");
      return;
    }

    error = "";
    loading = true;

    try {
      const response = await $API.checkPassword(password, challenge.trackId);
      if (response?.error) {
        error = parseApiError(response);
        loading = false;
        return;
      }
      sessionSet("challenge", null);
      loading = false;
      goto("/");
    } catch (e) {
      loading = false;
      error = parseApiError(e);
    }
  }

</script>

<AuthShell title="Ещё один шаг" description="Для этого аккаунта включена двухфакторная защита. Введите ваш пароль." icon="crypto" backHref="/auth/login">
  <form class="auth-form" on:submit|preventDefault={verify} novalidate>
    <div class="auth-field">
      <label for="auth-password">Пароль</label>
      <div class="auth-input-wrap has-toggle">
        <input class="auth-input" id="auth-password" type={showPassword ? 'text' : 'password'} bind:value={password} placeholder="Ваш пароль" autocomplete="current-password" required aria-invalid={!!error} aria-describedby={error ? 'password-error' : challenge?.hint ? 'password-hint' : undefined} />
        <button type="button" class="auth-toggle" on:click={() => (showPassword = !showPassword)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} aria-pressed={showPassword}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
            {#if showPassword}<path d="m3 3 18 18"></path>{/if}
          </svg>
        </button>
      </div>
      {#if error}<p class="auth-error" id="password-error" role="alert">{error}</p>
      {:else if challenge?.hint}<p class="auth-field-hint" id="password-hint">Подсказка: {challenge.hint}</p>{/if}
    </div>
    <SubmitButton text="Войти" busy={loading} busyText="Проверяем пароль…" />
  </form>
</AuthShell>

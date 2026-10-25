<script>
  import Icon from '$components/main/Icon.svelte';
  import { set as sessionSet } from '$lib/stores/session.js';
  import '$lib/styles/auth.css';

  export let title = '';
  export let description = '';
  export let mode = '';
  export let icon = '';
  export let backHref = '';
  export let backLabel = 'Назад';
</script>

<div class="auth-screen">
  <div class="auth-aurora" aria-hidden="true">
    <span class="aurora-blob aurora-a"></span>
    <span class="aurora-blob aurora-b"></span>
    <span class="aurora-blob aurora-c"></span>
  </div>

  <div class="auth-layout">
    <header class="auth-topbar">
      {#if backHref}
        <a class="auth-back" href={backHref}><Icon name="back" size={20} /><span>{backLabel}</span></a>
      {:else}
        <span class="auth-wordmark">Orbit<span class="auth-wordmark-dot" aria-hidden="true"></span></span>
      {/if}
    </header>

    <section class="auth-content" aria-labelledby="auth-title">
      <div class="auth-emblem" aria-hidden="true">
        {#if icon}
          <div class="auth-step-icon"><Icon name={icon} size={34} /></div>
        {:else}
          <div class="auth-brand-glass"><img src="/favicon.png" width="64" height="64" alt="" class="auth-brand-icon" /></div>
        {/if}
      </div>
      <div class="auth-heading">
        <h1 id="auth-title">{title}</h1>
        <p>{description}</p>
      </div>

      {#if mode}
        <nav class="auth-switch" aria-label="Вход или регистрация">
          <a href="/auth/login" aria-current={mode === 'login' ? 'page' : undefined}>Вход</a>
          <a href="/auth/register" aria-current={mode === 'register' ? 'page' : undefined}>Регистрация</a>
        </nav>
      {/if}

      <div class="auth-card"><slot /></div>
      <div class="auth-secondary"><slot name="secondary" /></div>
    </section>

    <footer class="auth-footer">
      <p><Icon name="crypto" size={15} /><span>Вход через ваш аккаунт MAX</span></p>
      <details class="auth-connection">
        <summary>Параметры подключения</summary>
        <div class="auth-connection-actions">
          <button type="button" on:click={() => sessionSet('devicesPage', true)}><Icon name="devices" size={18} />Устройство</button>
          <button type="button" on:click={() => sessionSet('devSettings', true)}><Icon name="params" size={18} />Настройки отладки</button>
        </div>
      </details>
    </footer>
  </div>
</div>

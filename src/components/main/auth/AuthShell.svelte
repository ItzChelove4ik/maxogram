<script>
  import Icon from '$components/main/Icon.svelte';
  import Scanner from '$components/main/Scanner.svelte';
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
  <div class="auth-scanner" aria-hidden="true">
    <Scanner
      color1="#94a3b8"
      color2="#000000"
      color3="#FFFFFF"
      speed={0.5}
      sweepSpeed={0.25}
      sweepWidth={1.6}
      trail={0.5}
      ripple={0.22}
      bandDensity={11}
      glow={0.6}
      scanDirection="vertical"
      colorSpread={0.7}
      scanline
      scanlineIntensity={0.5}
      mouseInteraction
      clickEffect="ping"
      reverse={false}
      scale={1.5}
      frequency={2}
      lineWidth={1.2}
      brightness={1}
      vignette={0.3}
      grain
      grainIntensity={0.04}
      opacity={1}
      mouseMode="repel"
      mouseRadius={0.5}
      mouseStrength={0.7}
      intro
      lightMode={false}
    />
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

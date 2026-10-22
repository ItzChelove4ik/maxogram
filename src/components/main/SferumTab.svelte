<script>
  import { openSferumApp } from "$lib/stores/webapp.js";

  let loading = false;
  let error = null;

  async function handleOpen() {
    loading = true;
    error = null;
    try {
      await openSferumApp();
    } catch (e) {
      error = e?.message || "Не удалось открыть Сферум";
    } finally {
      loading = false;
    }
  }
</script>

<div class="sferum-tab-container">
  <div class="sferum-card">
    <div class="sferum-icon-wrapper">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    </div>
    <h2 class="sferum-title">Сферум</h2>
    <p class="sferum-subtitle">Учебный профиль, чаты классов и сервисы образования</p>

    {#if error}
      <div class="error-box">
        <span>{error}</span>
      </div>
    {/if}

    <button class="open-sferum-btn" on:click={handleOpen} disabled={loading}>
      {#if loading}
        <span class="btn-spinner"></span>
        <span>Запуск...</span>
      {:else}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Открыть Сферум</span>
      {/if}
    </button>
  </div>
</div>

<style>
  .sferum-tab-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 24px;
    box-sizing: border-box;
    background: var(--bg-app);
    color: var(--text-primary);
  }

  .sferum-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    width: 100%;
    box-sizing: border-box;


    background: var(--bg-surface);
    border: 0;
    border-radius: 24px;
    box-shadow: none;
    padding: 32px 24px;
    max-width: 440px;
  }

  .sferum-icon-wrapper {
    width: 84px;
    height: 84px;
    border-radius: 22px;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(0, 119, 255, 0.35);
  }

  .sferum-title {
    margin: 0 0 8px;

    font-weight: 700;

    font-size: 1.6rem;
    color: var(--text-primary);
  }

  .sferum-subtitle {
    margin: 0 0 24px;



    font-size: 1rem;
    line-height: 1.5;
    color: var(--text-muted);
  }

  .error-box {
    margin-bottom: 16px;
    padding: 10px 14px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid var(--status-danger);
    border-radius: 10px;
    color: var(--status-danger);
    font-size: 0.7647rem;
    width: 100%;
    box-sizing: border-box;
  }

  .open-sferum-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px 20px;


    border: none;
    font-size: 0.9412rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;

    border-radius: 14px;
    min-height: 50px;
    color: var(--text-on-accent);
    background: var(--accent-primary);
  }

  .open-sferum-btn:hover:not(:disabled) {
    background: var(--accent-primary);
  }

  .open-sferum-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .open-sferum-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-subtle);
    border-top-color: var(--border-subtle);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

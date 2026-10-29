<script>
  import { createEventDispatcher } from "svelte";

  export let editingMessage = null;

  const dispatch = createEventDispatcher();

  function cancel() {
    dispatch("cancel");
  }
</script>

{#if editingMessage}
  <div class="editing-banner">
    <div class="editing-icon">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
    </div>
    <div class="editing-details">
      <div class="editing-title">Редактирование сообщения</div>
      <div class="editing-snippet">{editingMessage.text || 'Вложения'}</div>
    </div>
    <button class="editing-cancel-btn" type="button" on:click={cancel} title="Отменить">✕</button>
  </div>
{/if}

<style>
  .editing-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    background: var(--bg-app);
    border-top: 1px solid var(--border-subtle);
    border-left: 3px solid var(--accent-primary);
  }

  .editing-icon {
    color: var(--accent-primary);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .editing-details {
    flex: 1;
    min-width: 0;
  }

  .editing-title {
    font-size: 0.7647rem;
    font-weight: 600;
    color: var(--accent-primary);
  }

  .editing-snippet {
    font-size: 0.7059rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .editing-cancel-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.8235rem;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.15s ease;
  }

  .editing-cancel-btn:hover {
    color: var(--text-primary);
  }
</style>

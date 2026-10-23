<script>
  import { fade, fly } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { focusDialog } from '$lib/actions/focusDialog.js';

  export let title = "Подтверждение";
  export let message = "Вы уверены?";
  export let confirmText = "Удалить";
  export let cancelText = "Отмена";
  export let isDangerous = true;

  const dispatch = createEventDispatcher();
  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === 'Escape') { event.stopPropagation(); dispatch('cancel'); }
  }
</script>

<div
  class="modal-backdrop"
  role="presentation"
  transition:fade={{ duration: 200 }}
  on:click={() => dispatch("cancel")}
>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
    use:focusDialog
    on:keydown={handleKeydown}
    transition:fly={{ y: 20, duration: 250 }}
    on:click|stopPropagation
  >
    <div class="content">
      <h3>{title}</h3>
      <p>{message}</p>
      <slot />
    </div>

    <div class="footer">
      <button class="btn cancel" on:click={() => dispatch("cancel")}
        >{cancelText}</button
      >
      <button
        class="btn confirm"
        class:danger={isDangerous}
        on:click={() => dispatch("confirm")}
      >
        {confirmText}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--scrim);
    z-index: 200;
    display: flex;
    justify-content: center;
    align-items: center;
    will-change: opacity;
  }

  .modal {
    width: 85%;
    max-width: 320px;

    display: flex;
    flex-direction: column;
    color: var(--text-primary);

    overflow: hidden;
    will-change: transform, opacity;
    transform: translateZ(0);

    background: var(--bg-sheet);
    border-radius: 24px;
    box-shadow: var(--shadow-sheet);
    border: 0;
  }

  .content {
    padding: 24px 20px;
    text-align: center;
  }

  .content h3 {
    margin: 0 0 10px 0;

    color: var(--text-primary);

    font-size: 1.176rem;
    font-weight: 600;
  }

  .content p {
    margin: 0;
    font-size: 0.8235rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .footer {
    display: flex;
    border-top: 1px solid var(--border-subtle);
    height: 50px;
  }

  .btn {
    flex: 1;
    background: transparent;
    border: none;

    cursor: pointer;
    transition: 0.2s;

    min-height: 48px;
    font-size: 1rem;
    border-radius: 12px;
  }

  .btn:active {
    background: var(--bg-surface-2);
  }

  .btn.cancel {
    color: var(--accent-primary);
    border-right: 1px solid var(--border-subtle);
  }

  .btn.confirm {
    font-weight: 600;

    color: var(--accent-primary);
  }

  .btn.confirm.danger {
    color: var(--status-danger);
  }
</style>

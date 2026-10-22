<script>
  import { fade, fly } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { focusDialog } from '$lib/actions/focusDialog.js';

  export let title = "Ввод данных";
  export let submitText = "Сохранить";
  export let cancelText = "Отмена";

  export let fields = [
    {
      key: "name",
      label: "Имя",
      placeholder: "Введите имя",
      value: ""
    }
  ];

  const dispatch = createEventDispatcher();
  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === 'Escape') { event.stopPropagation(); dispatch('cancel'); }
  }

  let formData = {};

  fields.forEach((field) => {
    formData[field.key] = field.value || "";
  });

  function submit() {
    dispatch("submit", formData);
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

      {#each fields as field}
        <label class="field">
          <span>{field.label}</span>

          {#if field.multiline}
            <textarea
              bind:value={formData[field.key]}
              placeholder={field.placeholder}
              rows={field.rows || 3}
            />
          {:else}
            <input
              bind:value={formData[field.key]}
              placeholder={field.placeholder}
              type={field.type || "text"}
            />
          {/if}
        </label>
      {/each}
    </div>

    <div class="footer">
      <button
        class="btn cancel"
        on:click={() => dispatch("cancel")}
      >
        {cancelText}
      </button>

      <button
        class="btn submit"
        on:click={submit}
      >
        {submitText}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: var(--scrim);
    z-index: 200;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    width: 85%;
    max-width: 340px;

    color: var(--text-primary);

    overflow: hidden;
    max-height: calc(100dvh - 48px - var(--safe-area-top) - var(--safe-area-bottom));
    display: flex;
    flex-direction: column;


    background: var(--bg-sheet);
    border-radius: 24px;
    box-shadow: var(--shadow-sheet);
    border: 0;
  }

  .content {
    padding: 20px;
    overflow-y: auto;
  }

  .content h3 {
    margin: 0 0 16px;
    text-align: center;


    font-size: 1.176rem;
    font-weight: 600;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .field span {
    font-size: 0.7647rem;
    color: var(--text-muted);
  }

  .field input {
    height: 44px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    outline: none;
    font-size: 1rem;
  }

  .field input:focus {
    border-color: var(--accent-primary);
  }

  .field textarea {
    min-height: 80px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    outline: none;
    font-size: 0.8235rem;
    resize: none;
  }

  .footer {
    display: flex;
    border-top: 1px solid var(--border-subtle);
    height: 50px;
    flex-shrink: 0;
  }

  .btn {
    flex: 1;
    border: none;
    background: transparent;

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

  .btn.submit {
    font-weight: 600;

    color: var(--accent-primary);
  }
</style>

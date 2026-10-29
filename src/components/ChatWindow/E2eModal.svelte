<script>
  import { fade, scale } from "svelte/transition";
  import { handleEnc, dismissRequest } from "$components/ChatWindow/e2e.js";

  export let gotSecretChatRequest;

  export let chat;
  export let messages;
  export let chatSettings;

  async function action(name) {
    const res = await handleEnc(chat, chatSettings, messages, name);
    gotSecretChatRequest = null;
    return res;
  }

  function closeModal() {
    if (gotSecretChatRequest?.messageId) {
      dismissRequest(chat?.id, gotSecretChatRequest.messageId);
    }
    gotSecretChatRequest = null;
  }

  function handleKeydown(e) {
    if (e.key === "Escape") {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if gotSecretChatRequest}
  <div class="modal-backdrop" transition:fade={{ duration: 150 }} on:click={closeModal}>
    <div class="modal-content" transition:scale={{ start: 0.95, duration: 150 }} on:click|stopPropagation>
      <div class="modal-header">
        <div class="icon-wrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>Секретный чат</h2>
      </div>

      <div class="modal-body">
        <p>Собеседник предлагает защитить переписку с помощью шифрования</p>

        <div class="warning-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <p>
            <strong>Внимание:</strong> после выхода из аккаунта вы, скорее всего,
            не сможете прочесть сообщения из этого чата
          </p>
        </div>
      </div>

      <div class="modal-actions">
        <div class="main-actions">
          <button on:click={() => action("agree")} class="btn btn-primary"
            >Согласиться</button
          >
          <button on:click={() => action("deny")} class="btn btn-secondary"
            >Отказаться</button
          >
        </div>
        <button on:click={() => action("block")} class="btn btn-link"
          >Не показывать 5 минут</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.72);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 16px;
  }

  .modal-content {
    background-color: var(--bg-surface);
    color: var(--text-primary);
    border-radius: 16px;
    padding: 24px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid var(--border-subtle);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65);
  }

  .modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: var(--text-primary);
  }

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(var(--success-rgb), 0.12);
    color: var(--status-success);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.176rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .modal-body p {
    margin: 0;
    font-size: 0.8824rem;
    line-height: 1.5;
    color: var(--text-muted);
  }

  .warning-box {
    background-color: rgba(234, 179, 8, 0.1);
    border: 1px solid var(--status-warning);
    border-radius: 10px;
    padding: 12px;
    margin-top: 14px;
    display: flex;
    align-items: center;
    text-align: left;
    gap: 10px;
  }

  .warning-box svg {
    stroke: var(--status-warning);
    flex-shrink: 0;
  }

  .warning-box p {
    font-size: 0.7647rem;
    color: var(--status-warning);
    line-height: 1.45;
  }

  .warning-box p strong {
    color: var(--status-warning);
  }

  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 6px;
  }

  .main-actions {
    display: flex;
    gap: 12px;
  }

  .btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 0.8824rem;
    font-weight: 600;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .btn:hover {
    transform: translateY(-1px);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn.btn-primary {
    background-color: var(--status-success);
    color: var(--text-on-success);
  }

  .btn.btn-primary:hover {
    background-color: var(--status-success);
  }

  .btn.btn-secondary {
    background-color: var(--bg-hover);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
  }

  .btn.btn-secondary:hover {
    background-color: var(--bg-fill);
  }

  .btn.btn-link {
    background: none;
    color: var(--text-muted);
    font-weight: 500;
    font-size: 0.7647rem;
    padding: 6px;
  }

  .btn.btn-link:hover {
    color: var(--text-muted);
    text-decoration: underline;
    transform: none;
  }
</style>

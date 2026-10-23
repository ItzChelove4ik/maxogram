<script>
  import { createEventDispatcher } from "svelte";
  import MessagePreview from "$components/main/MessagePreview.svelte";

  export let msg;
  export let chat;

  const dispatch = createEventDispatcher();

  function unpin(e) {
    e.stopPropagation();
    dispatch("unpin", { id: msg.id });
  }
</script>

<div class="pinned-message">
  <div class="pin-icon">📌</div>

  <div class="pinned-body">
    <div class="pinned-title">Закреплено</div>
    <div class="pinned-text">
      <MessagePreview {chat} {msg} />
    </div>
  </div>

  <button class="unpin-btn" on:click={unpin}>✖</button>
</div>

<style>
  .pinned-message {
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    background: var(--bg-app);
    border-bottom: 1px solid var(--border-subtle);
    cursor: pointer;
  }

  .pin-icon {
    flex: 0 0 auto;
    font-size: 0.8235rem;
    opacity: 0.8;
    padding: 8px;
  }

  .pinned-body {
    flex: 1;
    min-width: 0;
  }

  .pinned-title {
    font-size: 0.6471rem;
    opacity: 0.6;
    margin-bottom: 2px;
  }

  .pinned-text {
    font-size: 0.7647rem;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    max-width: 100%;
  }

  .unpin-btn {
    flex: 0 0 auto;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.7647rem;
    color: var(--text-primary);
    opacity: 0.9;
    padding: 4px 6px;
    border-radius: 6px;
  }

  .unpin-btn:hover {
    color: var(--text-primary);
    opacity: 1;
    background: var(--bg-fill);
  }
</style>

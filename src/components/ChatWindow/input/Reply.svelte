<script>
  import { getAttachText } from "$lib/utils/attachs.js";
  import { getContact } from "$lib/stores/contacts";

  export let replyTo;
  export let messages;
  export let chat;

  $: replyToMsg = $messages.find((x) => x.id === replyTo);
  $: cachedContact = getContact(replyToMsg.sender);
  $: contact = $cachedContact || {
    names: [{ first_name: "?" }],
  };
  $: attachText = getAttachText(chat, replyToMsg);
</script>

<div class="reply-preview">
  <div class="reply-line"></div>

  <div class="reply-content">
    <div class="reply-author">
      Ответ <b>{contact.names[0].firstName}</b>
    </div>

    <div class="reply-text">
      <b>{attachText ? attachText + (replyToMsg.text ? "," : "") : ""}</b>
      {replyToMsg.text}
    </div>
  </div>

  <button class="reply-close" on:click={() => (replyTo = null)}> ✕ </button>
</div>

<style>
  .reply-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-app);
    border-radius: 10px;
    padding: 8px 10px;
    margin: 0 8px 6px 8px;
    position: relative;
  }

  .reply-line {
    width: 3px;
    height: 100%;
    background: var(--accent-primary);
    border-radius: 2px;
    flex-shrink: 0;
  }

  .reply-content {
    flex-grow: 1;
    overflow: hidden;
    padding: 3px 0;
  }

  .reply-author {
    font-size: 0.7647rem;
    color: var(--accent-primary);
    font-weight: 500;
  }

  .reply-text {
    margin-top: 2px;
    font-size: 0.8235rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .reply-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1.059rem;
    opacity: 0.6;
    transition: 0.2s;
  }

  .reply-close:hover {
    opacity: 1;
  }
</style>

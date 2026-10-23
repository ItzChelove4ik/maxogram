<script>
  import Avatar from "$components/main/Avatar.svelte";
  import { getContact } from "$lib/utils/caching";

  export let userId;
  export let readTime;
  export let reaction = null;

  $: contactStore = userId ? getContact(userId) : null;
  $: contact = $contactStore;
  $: displayName =
    contact?.names?.[0]?.name ||
    contact?.name ||
    (contact?.firstName ? `${contact.firstName} ${contact.lastName || ""}`.trim() : "") ||
    `Пользователь ${userId}`;

  function formatTime(ts) {
    if (!ts) return "";
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `сегодня в ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `вчера в ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div class="seen-by-item">
  <div class="avatar-wrap">
    <Avatar {userId} size={38} />
  </div>
  <div class="user-meta">
    <div class="user-name">{displayName}</div>
    <div class="user-read-time">{formatTime(readTime)}</div>
  </div>
  {#if reaction}
    <div class="reaction-badge">{reaction}</div>
  {/if}
</div>

<style>
  .seen-by-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 10px;
    transition: background 0.15s ease;
  }

  .seen-by-item:hover {
    background: var(--bg-hover);
  }

  .avatar-wrap {
    flex-shrink: 0;
  }

  .user-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    font-size: 0.8235rem;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-read-time {
    font-size: 0.7059rem;
    color: var(--text-muted);
  }

  .reaction-badge {
    flex-shrink: 0;
    font-size: 1.059rem;
    padding: 2px 6px;
    background: var(--bg-hover);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

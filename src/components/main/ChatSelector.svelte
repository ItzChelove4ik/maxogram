<script>
  import { createEventDispatcher } from "svelte";
  import { currentRealChats } from "$lib/stores/api.js";
  import { getChat } from "$lib/stores/messages.js";
  import ChatItem from "$components/chats/ChatItem.svelte";
  import Search from "$components/main/Search.svelte";
  import Icon from "$components/main/Icon.svelte";

  /** @type {(string | number)[]} */
  export let selectedIds = [];
  export let actionTitle = "Выберите чаты";
  export let multiSelect = true;

  const dispatch = createEventDispatcher();
  let searchQuery = "";

  $: allChats = ($currentRealChats || []).map(id => getChat(id).getInfo()).filter(Boolean);
  $: filteredChats = allChats.filter((chat) => {
    if (searchQuery) {
      const title = chat.title || chat.participants?.[0]?.name || "";
      if (!title.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
    }
    return true;
  });

  function toggleSelection(chatId) {
    if (selectedIds.includes(chatId)) {
      selectedIds = selectedIds.filter((id) => id !== chatId);
    } else {
      if (!multiSelect) selectedIds = [];
      selectedIds = [...selectedIds, chatId];
    }
  }

  function handleDone() {
    dispatch("done", selectedIds);
  }
</script>

<div class="selector-layout">
  <header>
    <div class="row">
      <button class="icon-btn" aria-label="Закрыть выбор чатов" on:click={() => dispatch("cancel")}><Icon name="close" /></button>
      <h3>{actionTitle}</h3>
      <button class="icon-btn check" on:click={handleDone}>Готово</button>
    </div>
    <Search input={(value) => (searchQuery = value)} placeholder="Поиск чатов" />
  </header>

  <div class="list">
    {#each filteredChats as chat (chat.id)}
      <div class="select-item" role="checkbox" aria-checked={selectedIds.includes(chat.id)} aria-label={chat.title || chat.participants?.[0]?.name || 'Чат'} tabindex="0" on:keydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleSelection(chat.id); } }} on:click={() => toggleSelection(chat.id)}>
        <div class="pointer-events-none" inert>
          <ChatItem {chat} />
        </div>
        <div class="checkbox" class:checked={selectedIds.includes(chat.id)}>
          {#if selectedIds.includes(chat.id)}✓{/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .selector-layout {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-surface);
    z-index: 100;
    display: flex;
    flex-direction: column;
  }
  header {
    padding: 10px;
    background: var(--bg-surface);
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.059rem;
  }
  .icon-btn {
    min-width: 44px;
    min-height: 44px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.059rem;
    cursor: pointer;
    padding: 10px;
  }
  .icon-btn.check {
    color: var(--accent-primary);
    font-weight: bold;
  }

  .list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .select-item {
    position: relative;
    display: flex;
    align-items: center;
    /* pointer-events-none для ChatItem, чтобы клик обрабатывал родитель */
  }
  .pointer-events-none {
    flex: 1;
    pointer-events: none;
  }

  .checkbox {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--border-subtle);
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-weight: bold;
    font-size: 0.8235rem;
    transition: 0.2s;
  }
  .checkbox.checked {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: var(--text-on-accent);
  }
</style>

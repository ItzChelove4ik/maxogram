<script>
  import { goto } from "$app/navigation";
  import { writable, derived } from "svelte/store";
  import API, {
    currentRealContacts,
    currentUser,
  } from "$lib/stores/api";
  import {
    getContact,
    getCachedContacts
  } from "$lib/stores/contacts";
  import {
    set as sessionSet
  } from "$lib/stores/session";
  import Search from "$components/main/Search.svelte";
  import ConfirmModal from "$components/main/ConfirmModal.svelte";
  import Signature from "$components/main/Signature.svelte";
  import Avatar from "$components/main/Avatar.svelte";

  import AddContactBtn from "$components/main/AddContactBtn.svelte";

  import "$lib/styles/AnimatedPanel.css";

  export let hideHeader = false;

  let grouped = {};
  let filter = "";
  let showAll = false;
  let showDeleteConfirm = false;

  const contactStores = writable([]);

  $: if (showAll) {
    getCachedContacts().then(contacts => {
      contactStores.set(
        contacts.map(contact => getContact(contact.id))
      );
    });
  } else {
    contactStores.set(
      $currentRealContacts.map(id => getContact(id))
    );
  }

  const contactsStore = derived(
    contactStores,
    ($stores, set) => {
      const values = [];
      const unsubscribers = $stores.map((store, index) => {
        return store.subscribe(value => {
          values[index] = value;
          set([...values]);
        });
      });

      return () => {
        unsubscribers.forEach(unsub => unsub());
      };
    },
    []
  );

  $: grouped = $contactsStore
    .filter(
      (x) =>
        x && x.id !== $currentUser &&
        (!filter || x.names?.[0]?.name.match(new RegExp(filter, "i"))) &&
        (showAll || (x.options?.includes("TT") && x.status !== "REMOVED" && x.accountStatus !== undefined))
    )
    .sort((a, b) =>
      (a.names?.[0]?.name || "").localeCompare(b.names?.[0]?.name || "", "ru")
    )
    .reduce((acc, c) => {
      const letter = (c.names?.[0]?.name || "").charAt(0).toUpperCase();
      (acc[letter] ??= []).push(c);
      return acc;
    }, {});

  async function removeContact(id) {
    await $API.removeContact(id);
  }

  const search = (query) => {
    filter = query;
  };

  const filterSwap = (event) => {
    showAll = event?.target?.checked || false;
  };

  const open = (e, contact) => {
    const toDelete = [".delete"].some((x) => e.target.closest(x));
    if (toDelete) {
      removeContact(contact.id);
    } else {
      sessionSet("profile", { userId: contact.id });
    }
  };

  function deleteSelected() {
    if (selectedChats.size === 0) return;
    showDeleteConfirm = true;
  }

  async function onConfirmDelete() {
    await $API.removeContact(id);

    clearSelection();
    showDeleteConfirm = false;
  }
</script>

<div class="container" class:modal-mode={hideHeader}>
  {#if !hideHeader}
    <header>
      <div class="row">
        <h3 style="margin-left: 15px;">Контакты</h3>
        <div style="margin-right: 15px;" class="flex-end">
          <AddContactBtn />
        </div>
      </div>
      <Search input={search} placeholder="Имя, фамилия или ник" />
    </header>
  {:else}
    <div class="modal-search-wrapper">
      <Search input={search} placeholder="Имя, фамилия или ник" />
    </div>
  {/if}

  {#if showDeleteConfirm}
    <ConfirmModal
      title="Удалить чаты?"
      message={`Вы точно хотите удалить выбранные чаты (${selectedChats.size})? Это действие нельзя отменить.`}
      confirmText="Удалить"
      isDangerous={true}
      on:cancel={() => (showDeleteConfirm = false)}
      on:confirm={onConfirmDelete}
    />
  {/if}

  <label class="showAll" style={hideHeader ? "margin-left: 0; padding-right: 15px;" : "margin-left: -15px;"}>
    <input
      type="checkbox"
      id="only-added"
      name="only-added"
      on:click={filterSwap}
    />
    <span class="checkmark"></span>
    Отобразить полный кеш
  </label>

  <main class="content">
    {#each Object.keys(grouped) as letter}
      <a>{letter}</a>
      {#each grouped[letter] as contact}
        <div class="contact" on:click={(e) => open(e, contact)}>
          <Avatar contactId={contact.id} size={44} />
          <div class="column">
            <div class="name">
              {contact.names[0].name}
            </div>
            <a><Signature contactId={contact.id} /></a>
          </div>
          <div class="action">
            {#if $currentRealContacts.includes(contact.id) && contact.status !== "REMOVED"}
              <a class="delete">Удалить</a>
            {:else}
              <a>Не контакт</a>
            {/if}
          </div>
        </div>
      {/each}
    {/each}
    {#if Object.keys(grouped).length === 0}
      <a style="font-size:14px">Ничего не найдено!</a>
    {/if}
  </main>
</div>

<style>
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-search-wrapper {
    padding: 8px 12px 4px;
    flex-shrink: 0;
  }

  header {
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;

    margin-top: 10px;
    margin-bottom: 5px;

    margin: 0;
    padding: 20px 0 12px;
    gap: 12px;
    background: var(--bg-surface);
  }

  header h3 {
    margin: 0;


    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -.035em;
    color: var(--text-primary);
  }

  .row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .flex-end {
    display: flex;
    gap: 15px;
  }

  .showAll {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;

    cursor: pointer;

    font-size: .7647rem;
    min-height: 44px;
    color: var(--text-muted);
  }

  .showAll input {

    display: block;
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-subtle);
    border-radius: 6px;
    position: relative;
    transition: all 0.2s ease;
  }

  .checkmark::after {
    content: "";
    position: absolute;
    left: 7px;
    top: 2px;
    width: 4px;
    height: 10px;
    border: solid var(--border-subtle);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) scale(0);
    transition: transform 0.1s ease;
  }

  .showAll input:checked + .checkmark {
    background-color: var(--accent-primary);
    border-color: var(--accent-primary);
  }

  .showAll input:checked + .checkmark::after {
    transform: rotate(45deg) scale(1);
  }

  .showAll:hover .checkmark {
    border-color: var(--accent-primary);
  }

  .content {
    flex: 1 1 auto;
    min-height: 0;
    color: var(--text-secondary);

    display: flex;
    flex-direction: column;

    overflow-y: auto;
    overflow-x: hidden;

    padding: 0 16px 24px;
    gap: 0;
    background: var(--bg-surface);
  }

  .contact {
    position: relative;

    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    gap: 16px;

    height: auto;
    min-height: 72px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-card);
  }

  .contact .column {
    display: flex;
    flex-direction: column;
  }

  .contact .name {
    display: flex;

    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .contact a {
    color: var(--text-muted);
    position: relative;

    font-size: .7647rem;
  }

  .contact .delete {
    color: var(--status-danger);
  }

  .contact .action {
    position: absolute;
    right: 10px;
    margin-bottom: 10px;
  }
  .showAll input:focus-visible + .checkmark {
    outline: 2px solid var(--accent-primary);
    outline-offset: 3px;
  }
</style>

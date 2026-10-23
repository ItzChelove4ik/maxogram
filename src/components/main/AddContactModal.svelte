<script>
  import { fade, scale, fly } from "svelte/transition";
  import { createEventDispatcher, onDestroy } from "svelte";
  import API from "$lib/stores/api.js";
  import { registerBackHandler } from "$lib/utils/backButton.js";

  const dispatch = createEventDispatcher();

  const unregisterBack = registerBackHandler(() => {
    close();
  });

  onDestroy(() => {
    unregisterBack();
  });

  let name = "";
  let phone = "+";
  let isLoading = false;
  let groupName = "";
  let mode = "contact";

  let errors = {
    name: "",
    phone: "",
  };

  const validate = () => {
    let isValid = true;
    errors = { name: "", phone: "" };

    if (!name || name.trim().length < 1) {
      errors.name = "Введите имя контакта";
      isValid = false;
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      errors.phone = "Введите корректный номер (от 7 до 15 цифр)";
      isValid = false;
    }

    return isValid;
  };

  const submitHandler = async () => {
    if (isLoading) return;

    isLoading = true;

    let response;

    if (mode === "contact") {
      if (!validate()) {
        isLoading = false;
        return;
      }

      const formattedPhone = phone.startsWith("+") ? phone : "+" + phone;
      response = await $API.addContact(name, formattedPhone);
    }

    if (mode === "group") {
      if (!groupName.trim()) {
        isLoading = false;
        return;
      }

      response = await $API.createGroup(groupName);
    }

    isLoading = false;

    console.log('a')

    if (!response?.success) {
      console.log(response);
      errors.phone = response?.localizedMessage || "Ошибка";
      return;
    }

    dispatch("close");
  };

  function handleInput(event) {
    let raw = event.target.value.replace(/[^\d+]/g, "");

    if (!raw.startsWith("+")) {
      raw = "+" + raw.replace(/\+/g, "");
    } else {
      raw = "+" + raw.slice(1).replace(/\+/g, "");
    }

    phone = raw;
    event.target.value = phone;
    errors.phone = "";
  }

  const close = () => dispatch("close");
</script>

<div
  class="modal-backdrop"
  transition:fade={{ duration: 200 }}
  on:click={close}
>
  <div
    transition:fly={{ duration: 300, y: 50 }}
    on:click|stopPropagation
    class="tabs"
  >
    <button class:active={mode === "contact"} on:click={() => (mode = "contact")}>
      Контакт
    </button>
    <button class:active={mode === "group"} on:click={() => (mode = "group")}>
      Группа
    </button>
  </div>

  <div
    class="modal"
    transition:scale={{ duration: 200, start: 0.95 }}
    on:click|stopPropagation
  >
    <div class="header">
      <h3>{ mode === "contact" ? "Новый контакт" : "Новая группа" }</h3>
      <button class="close-btn" on:click={close}>&times;</button>
    </div>

    <div class="content">
      {#if mode === "contact"}
        <div class="input-group">
          <label>Имя</label>
          <div class="input-wrapper" class:has-error={errors.name}>
            <input
              type="text"
              bind:value={name}
              placeholder="Иван Иванов"
              on:input={() => (errors.name = "")}
            />
          </div>
          {#if errors.name}
            <span class="error-msg" transition:fade>{errors.name}</span>
          {/if}
        </div>

        <div class="input-group">
          <label>Номер телефона</label>
          <div class="input-wrapper" class:has-error={errors.phone}>
            <input
              type="tel"
              value={phone}
              placeholder="+374 91 123456"
              on:input={handleInput}
            />
          </div>
          {#if errors.phone}
            <span class="error-msg" transition:fade>{errors.phone}</span>
          {/if}
        </div>
      {:else}
        <div class="input-group">
          <label>Название группы</label>
          <div class="input-wrapper">
            <input
              type="text"
              bind:value={groupName}
              placeholder="Друзья / Работа / Семья"
            />
          </div>
        </div>
      {/if}
    </div>

    <div class="footer">
      <button class="btn cancel" on:click={close}>Отмена</button>
      <button class="btn save" on:click={submitHandler} disabled={isLoading}>
        {#if isLoading}
          ...
        {:else}
          {mode === "contact" ? "Добавить контакт" : "Создать группу"}
        {/if}
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
    background: rgba(0, 0, 0, 0.65);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 10px;
  }

  .modal {
    background: var(--bg-surface);
    width: 90%;
    max-width: 350px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    color: var(--text-primary);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    border: 1px solid var(--border-subtle);
  }

  .tabs {
    display: flex;
    gap: 8px;
    width: 90%;
    max-width: 350px;
  }

  .tabs button {
    flex: 1;
    background: var(--bg-app);
    border: none;
    color: var(--text-muted);
    padding: 8px 6px;
    border-radius: 12px;
    cursor: pointer;
  }

  .tabs button.active {
    background: var(--accent-primary);
    color: var(--text-on-accent);
    border-color: var(--accent-primary);
  }

  .header {
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.412rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: var(--text-primary);
  }

  .content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-muted);
    font-size: 0.7647rem;
    font-weight: 500;
  }

  .input-wrapper {
    background: var(--bg-app);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    transition: 0.2s;
  }
  .input-wrapper:focus-within {
    border-color: var(--accent-primary);
    background: var(--bg-app);
  }
  .input-wrapper.has-error {
    border-color: var(--status-danger);
  }

  input {
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 0.8824rem;
    outline: none;
  }
  input::placeholder {
    color: var(--text-muted);
  }

  .error-msg {
    display: block;
    color: var(--status-danger);
    font-size: 0.7059rem;
    margin-top: 5px;
    padding-left: 2px;
  }

  .footer {
    padding: 15px 20px;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: var(--bg-surface);
    border-radius: 0 0 14px 14px;
  }

  .btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.8235rem;
    transition: 0.2s;
  }
  .btn.cancel {
    background: transparent;
    color: var(--accent-primary);
  }
  .btn.cancel:hover {
    background: rgba(var(--accent-rgb), 0.1);
  }

  .btn.save {
    background: var(--accent-primary);
    color: var(--text-on-accent);
  }
  .btn.save:hover {
    background: var(--accent-primary);
  }
  .btn.save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

<script>
  import Session from '$lib/stores/session';
  import Icon from './Icon.svelte';
</script>
<button class="add-contact" type="button" aria-label="Добавить контакт" aria-expanded={!!$Session.contactModal} on:click={() => ($Session.contactModal = true)}><Icon name="plus" size={24} /></button>
<style>
  .add-contact { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 50%; background: var(--accent-subtle); color: var(--accent-primary); }
</style>

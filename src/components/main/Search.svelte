<script>
  import Icon from './Icon.svelte';
  export let placeholder = 'Поиск';
  /** @type {((value: string) => void) | undefined} */
  export let input = undefined;
  let query = '';
  $: input && input(query);
</script>

<div class="search-block">
  <Icon name="search" size={19} />
  <input type="search" {placeholder} aria-label={placeholder} bind:value={query} />
  {#if query.length}
    <button type="button" aria-label="Очистить поиск" on:click={() => (query = '')}><Icon name="close" size={16} /></button>
  {/if}
</div>

<style>
  .search-block { background: var(--bg-input); color: var(--text-muted); width: calc(100% - 32px); min-height: 40px; border-radius: 11px; display: flex; align-items: center; align-self: center; padding: 0 12px; gap: 8px; }
  input { flex: 1; width: 0; min-width: 0; min-height: 40px; border: none; background: transparent; color: var(--text-primary); font-size: 1rem; padding: 0; outline: none; }
  input::-webkit-search-cancel-button { display: none; }
  button { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 44px; margin-right: -12px; border: 0; background: transparent; color: var(--text-muted); }
</style>

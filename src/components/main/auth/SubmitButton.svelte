<script>
  import Icon from '$components/main/Icon.svelte';
  export let text = 'Продолжить';
  export let busy = false;
  export let disabled = false;
  export let busyText = 'Подождите…';
</script>

<button class="auth-submit" type="submit" disabled={busy || disabled} aria-busy={busy}>
  <span>{busy ? busyText : text}</span>
  {#if busy}<span class="auth-spinner" aria-hidden="true"></span>
  {:else}<Icon name="chevron" size={20} />{/if}
</button>

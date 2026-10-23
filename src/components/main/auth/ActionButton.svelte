<script>
  import { onMount } from 'svelte';

  import "$lib/styles/AnimatedPanel.css";

  export let action;
  export let text;

  let clicked = false;
  let doingStuff = "";

  async function click() {
    if (clicked) return;
    clicked = true;
    const pointAnimation = setInterval(() => {
      if (doingStuff.length === 3) doingStuff = "";
      else doingStuff += ".";
    }, 100);
    try {
      await action()
    } catch (e) {
      console.error(e);
      alert(e);
    } finally {
      setTimeout(() => {
        clicked = false;
        clearInterval(pointAnimation);
        doingStuff = "";
      }, 400);
    }
  }

  onMount(() => {
    const handler = (e) => {
      if (e.key === 'Enter') click();
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  });
</script>

<button
  class="animated-panel"
  class:clicked={clicked}
  disabled={clicked}
  aria-busy={clicked}
  doing-stuff={doingStuff}
  on:click={click}>{ text }</button>

<style>
  button {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    font-size: 1rem;
    background: var(--accent-primary);
    color: var(--text-on-accent);
    transition: opacity 0.5s;
  }

  button {
    border: none;
    cursor: pointer;
  }

  button::after {
    content: attr(doing-stuff);
    position: absolute;
  }

  .clicked {
    opacity: 0.8;
  }
</style>

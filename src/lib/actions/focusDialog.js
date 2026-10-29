/** Keep keyboard focus inside the active dialog and restore it on close.
 * @param {HTMLElement} node
 */
export function focusDialog(node) {
  const previous = document.activeElement;
  const selector = 'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';
  const controls = () => Array.from(node.querySelectorAll(selector)).filter(
    element => element instanceof HTMLElement && !element.closest('[inert]') && element.getClientRects().length
  );
  /** @type {Map<HTMLElement, boolean>} */
  const siblings = new Map();
  let branch = node;
  while (branch.parentElement && branch.parentElement !== document.documentElement) {
    for (const sibling of branch.parentElement.children) {
      if (sibling !== branch && sibling instanceof HTMLElement && !['SCRIPT', 'STYLE'].includes(sibling.tagName)) {
        siblings.set(sibling, sibling.inert);
        sibling.inert = true;
      }
    }
    branch = branch.parentElement;
  }
  const frame = requestAnimationFrame(() => {
    const first = controls()[0];
    if (first instanceof HTMLElement) first.focus();
    else node.focus();
  });
  /** @param {KeyboardEvent} event */
  const keydown = event => {
    if (event.key !== 'Tab') return;
    const items = controls();
    const first = items[0];
    const last = items[items.length - 1];
    if (!items.length) { event.preventDefault(); node.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) {
      event.preventDefault();
      if (last instanceof HTMLElement) last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      if (first instanceof HTMLElement) first.focus();
    }
  };
  node.addEventListener('keydown', keydown);
  return {
    destroy() {
      cancelAnimationFrame(frame);
      node.removeEventListener('keydown', keydown);
      for (const [element, inert] of siblings) element.inert = inert;
      if (previous instanceof HTMLElement && previous.isConnected && !previous.closest('[inert]')) previous.focus();
    }
  };
}

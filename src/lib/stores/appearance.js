import { writable } from 'svelte/store';

/** @typedef {'system' | 'light' | 'dark'} Appearance */
const STORAGE_KEY = 'maxogram_appearance';

/** @returns {Appearance} */
function readPreference() {
  try {
    const value = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export const appearance = writable(readPreference());

/** @param {Appearance} value */
export function setAppearance(value) {
  appearance.set(value);
  try { localStorage.setItem(STORAGE_KEY, value); } catch {}
}

export function initAppearance() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = readPreference();
  const apply = () => {
    const dark = preference === 'dark' || (preference === 'system' && media.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#000000' : '#f2f2f7');
  };
  const unsubscribe = appearance.subscribe(value => { preference = value; apply(); });
  media.addEventListener('change', apply);
  return () => { unsubscribe(); media.removeEventListener('change', apply); };
}

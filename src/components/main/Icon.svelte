<script>
  export let name = '';
  export let size = 24;
  /** @type {Record<string, string>} */
  const paths = {
    chats: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8v.5Z',
    calls: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z',
    settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9.5 3h5l.7 2.4 2.1 1.2 2.4-.6 2.5 4.3-1.7 1.8v2.4l1.7 1.8-2.5 4.3-2.4-.6-2.1 1.2-.7 2.4h-5l-.7-2.4-2.1-1.2-2.4.6-2.5-4.3 1.7-1.8v-2.4L1.8 8.3 4.3 4l2.4.6 2.1-1.2L9.5 3Z',
    contacts: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    user: 'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    digital_id: 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM15 9h3M15 13h3M6 16c0-3 6-3 6 0M11 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
    book: 'M3 3h6a4 4 0 0 1 3 1.5A4 4 0 0 1 15 3h6v17h-6a4 4 0 0 0-3 1.5A4 4 0 0 0 9 20H3V3ZM12 4.5v17',
    logs: 'M4 3h16v18H4V3ZM8 7h8M8 12h8M8 17h4',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9ZM10 21h4',
    crypto: 'M5 11h14v10H5V11ZM8 11V7a4 4 0 0 1 8 0v4M12 15v2',
    about: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    phone: 'M9 3H3v6h6V3ZM21 3h-6v6h6V3ZM9 15H3v6h6v-6ZM21 15h-6v6h6v-6Z',
    params: 'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',
    devices: 'M3 4h18v12H3V4ZM8 21h8M12 16v5',
    logout: 'M9 21H4V3h5M9 12h12M17 8l4 4-4 4',
    bot: 'M5 7h14v13H5V7ZM12 3v4M9 12h.01M15 12h.01M9 16h6M2 11v5M22 11v5',
    qr: 'M3 3h6v6H3V3ZM15 3h6v6h-6V3ZM3 15h6v6H3v-6ZM15 15h3v3h3v3h-6v-6ZM21 15h.01',
    chevron: 'm9 5 7 7-7 7',
    back: 'm15 5-7 7 7 7',
    close: 'm6 6 12 12M18 6 6 18',
    plus: 'M12 5v14M5 12h14',
    search: 'm21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    compose: 'M12 4H4v16h16v-8M16 3l5 5-9 9-5 1 1-5 8-10Z',
    appearance: 'M12 2a10 10 0 1 0 0 20V2ZM12 2a10 10 0 0 1 0 20',
  };
  $: key = name.replace(/\.(svg|png)$/, '');
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d={paths[key] || paths.phone} />
</svg>

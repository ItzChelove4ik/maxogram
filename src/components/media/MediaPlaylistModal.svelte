<script>
  import {
    mediaPlaylist,
    showPlaylistModal,
    playPlaylistItem,
    activeMedia,
  } from '$lib/stores/mediaPlayback';

  $: items = $mediaPlaylist?.items || [];
  $: currentIndex = $mediaPlaylist?.currentIndex ?? -1;
  $: isPlaying = $activeMedia?.isPlaying ?? false;

  function closeModal() {
    showPlaylistModal.set(false);
  }

  function handleSelectTrack(index) {
    playPlaylistItem(index);
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const total = Math.round(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
</script>

{#if $showPlaylistModal}
  <div class="modal-backdrop" on:click|self={closeModal}>
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title-wrap">
          <span class="modal-title">Очередь воспроизведения</span>
          <span class="modal-count">{items.length} медиа</span>
        </div>
        <button class="modal-close-btn" on:click={closeModal} title="Закрыть">✕</button>
      </div>

      <div class="modal-body">
        {#if items.length === 0}
          <div class="empty-state">Нет голосовых и кружочков в очереди!</div>
        {:else}
          <div class="playlist-items-list">
            {#each items as item, index (item.id || item.messageId || index)}
              <div
                class="playlist-row"
                class:active={index === currentIndex}
                on:click={() => handleSelectTrack(index)}
              >
                <div class="row-left">
                  <div class="track-icon" class:active={index === currentIndex}>
                    {#if index === currentIndex && isPlaying}
                      <span class="sound-wave-anim">
                        <i></i><i></i><i></i>
                      </span>
                    {:else if item.type === 'video_note'}
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                    {:else}
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    {/if}
                  </div>
                  <div class="track-info">
                    <div class="track-sender">
                      {item.senderName || 'Чат'}
                    </div>
                    <div class="track-type">
                      {item.type === 'video_note' ? 'Видеосообщение' : 'Голосовое сообщение'}
                    </div>
                  </div>
                </div>

                <div class="row-right">
                  <span class="track-dur">{formatTime(item.duration)}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 16px;
  }
  .modal-dialog {
    width: 100%;
    max-width: 420px;
    max-height: 80vh;
    background: var(--bg-surface);
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    border: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .modal-title-wrap {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .modal-title {
    font-size: 0.9412rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  .modal-count {
    font-size: 0.7059rem;
    color: var(--text-muted);
  }
  .modal-close-btn {
    background: transparent;
    border: none;
    font-size: 0.9412rem;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .modal-close-btn:hover {
    background: var(--bg-fill);
    color: var(--text-primary);
  }
  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    overflow-anchor: none;
  }
  .empty-state {
    padding: 32px 16px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.8235rem;
  }
  .playlist-items-list {
    display: flex;
    flex-direction: column;
  }
  .playlist-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    cursor: pointer;
    transition: background 0.12s;
    user-select: none;
  }
  .playlist-row:hover {
    background: var(--bg-hover);
  }
  .playlist-row.active {
    background: rgba(var(--accent-rgb), 0.18);
  }
  .row-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .track-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-hover);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .track-icon.active {
    background: var(--accent-primary);
    color: var(--text-on-accent);
  }
  .track-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .track-sender {
    font-size: 0.8235rem;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .track-type {
    font-size: 0.7059rem;
    color: var(--text-muted);
  }
  .row-right {
    margin-left: 12px;
    flex-shrink: 0;
  }
  .track-dur {
    font-size: 0.7059rem;
    color: var(--text-muted);
  }
  .sound-wave-anim {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
  }
  .sound-wave-anim i {
    width: 2px;
    background: var(--bg-surface);
    border-radius: 1px;
    animation: wave 0.8s ease-in-out infinite alternate;
  }
  .sound-wave-anim i:nth-child(1) { animation-delay: 0.1s; }
  .sound-wave-anim i:nth-child(2) { animation-delay: 0.3s; }
  .sound-wave-anim i:nth-child(3) { animation-delay: 0.2s; }
  @keyframes wave {
    0% { height: 6px; }
    100% { height: 14px; }
  }
</style>

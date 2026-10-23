<script>
  import { createEventDispatcher } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  export let log;

  const dispatch = createEventDispatcher();

  let activeTab = "headers";
  let copiedField = null;

  function close() {
    dispatch("close");
  }

  async function copyText(text, fieldName) {
    try {
      await navigator.clipboard.writeText(text);
      copiedField = fieldName;
      setTimeout(() => {
        if (copiedField === fieldName) copiedField = null;
      }, 1500);
    } catch {}
  }

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function generateCurl(l) {
    let curl = `curl -X ${l.method} '${l.url}'`;
    if (l.request_headers && typeof l.request_headers === "object") {
      for (const [k, v] of Object.entries(l.request_headers)) {
        if (typeof v === "string") {
          curl += ` \\\n  -H '${k}: ${v.replace(/'/g, "'\\''")}'`;
        }
      }
    }
    if (l.request_body && typeof l.request_body === "string" && !l.request_body.startsWith("<binary")) {
      curl += ` \\\n  --data '${l.request_body.replace(/'/g, "'\\''")}'`;
    }
    return curl;
  }

  function formatContent(content) {
    if (!content) return "";
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  }

  function getStatusClass(status, blocked) {
    if (blocked) return "status-blocked";
    if (status >= 200 && status < 300) return "status-2xx";
    if (status >= 300 && status < 400) return "status-3xx";
    if (status >= 400 && status < 500) return "status-4xx";
    if (status >= 500) return "status-5xx";
    return "status-other";
  }

  $: formattedReqBody = formatContent(log?.request_body);
  $: formattedRespBody = formatContent(log?.response_body);
</script>

<div class="detail-backdrop" on:click={close} transition:fade={{ duration: 160 }}>
  <div class="detail-sheet" on:click|stopPropagation transition:fly={{ y: 360, duration: 250, easing: cubicOut }}>
    <div class="drag-handle-bar">
      <div class="drag-handle"></div>
    </div>
    <div class="sheet-header">
      <div class="header-left">
        <span class="status-pill {getStatusClass(log.status, log.blocked)}">
          {log.blocked ? "BLOCKED" : `${log.status} ${log.status_text || ""}`}
        </span>
        <span class="method-pill method-{log.method}">{log.method}</span>
        <span class="url-title" title={log.url}>{log.url}</span>
      </div>
      <button class="close-btn" on:click={close}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="quick-actions">
      <button class="action-chip" on:click={() => copyText(log.url, "url")}>
        <img src="/icons/copy.svg" alt="" />
        <span>{copiedField === "url" ? "Скопировано!" : "URL"}</span>
      </button>

      <button class="action-chip" on:click={() => copyText(generateCurl(log), "curl")}>
        <img src="/icons/copy.svg" alt="" />
        <span>{copiedField === "curl" ? "Скопировано!" : "cURL"}</span>
      </button>

      <button class="action-chip" on:click={() => copyText(JSON.stringify(log, null, 2), "all")}>
        <img src="/icons/copy.svg" alt="" />
        <span>{copiedField === "all" ? "Скопировано!" : "Все данные (JSON)"}</span>
      </button>

      <button class="action-chip block-chip" on:click={() => dispatch("blockUrl", log)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
        <span>Заблокировать</span>
      </button>
    </div>

    <div class="tabs-nav">
      <button class="tab-btn" class:active={activeTab === "headers"} on:click={() => (activeTab = "headers")}>
        Заголовки
      </button>
      <button class="tab-btn" class:active={activeTab === "response"} on:click={() => (activeTab = "response")}>
        Ответ {#if log.content_length > 0}<span class="tab-size">({formatBytes(log.content_length)})</span>{/if}
      </button>
      <button class="tab-btn" class:active={activeTab === "payload"} on:click={() => (activeTab = "payload")}>
        Тело запроса {#if log.request_body}<span class="tab-dot"></span>{/if}
      </button>
      <button class="tab-btn" class:active={activeTab === "overview"} on:click={() => (activeTab = "overview")}>
        Сводка
      </button>
    </div>

    <div class="tab-body">
      {#if activeTab === "headers"}
        <div class="section">
          <div class="section-title">Общая информация</div>
          <div class="kv-grid">
            <span class="key">Request URL</span>
            <span class="value code break-all">{log.url}</span>

            <span class="key">Request Method</span>
            <span class="value">{log.method}</span>

            <span class="key">Status</span>
            <span class="value">
              {log.blocked ? "DROPPED (Заблокировано фильтром)" : `${log.status} ${log.status_text || ""}`}
            </span>

            {#if log.block_reason}
              <span class="key">Причина блокировки</span>
              <span class="value text-red">{log.block_reason}</span>
            {/if}

            <span class="key">Origin</span>
            <span class="value code">{log.origin || "-"}</span>

            <span class="key">Время</span>
            <span class="value">{log.duration_ms} ms ({log.timestamp})</span>
          </div>
        </div>

        <div class="section">
          <div class="section-header-row">
            <div class="section-title">Заголовки ответа (Response Headers)</div>
            {#if log.response_headers && Object.keys(log.response_headers).length > 0}
              <button class="copy-small-btn" on:click={() => copyText(JSON.stringify(log.response_headers, null, 2), "resp_headers")}>
                {copiedField === "resp_headers" ? "Скопировано!" : "Копировать"}
              </button>
            {/if}
          </div>
          {#if log.response_headers && Object.keys(log.response_headers).length > 0}
            <div class="kv-grid">
              {#each Object.entries(log.response_headers) as [k, v]}
                <span class="key">{k}</span>
                <span class="value code break-all">{v}</span>
              {/each}
            </div>
          {:else}
            <div class="empty-text">Нет заголовков ответа</div>
          {/if}
        </div>

        <div class="section">
          <div class="section-header-row">
            <div class="section-title">Заголовки запроса (Request Headers)</div>
            {#if log.request_headers && Object.keys(log.request_headers).length > 0}
              <button class="copy-small-btn" on:click={() => copyText(JSON.stringify(log.request_headers, null, 2), "req_headers")}>
                {copiedField === "req_headers" ? "Скопировано!" : "Копировать"}
              </button>
            {/if}
          </div>
          {#if log.request_headers && Object.keys(log.request_headers).length > 0}
            <div class="kv-grid">
              {#each Object.entries(log.request_headers) as [k, v]}
                <span class="key">{k}</span>
                <span class="value code break-all">{v}</span>
              {/each}
            </div>
          {:else}
            <div class="empty-text">Нет заголовков запроса</div>
          {/if}
        </div>

      {:else if activeTab === "response"}
        <div class="section">
          <div class="section-header-row">
            <div class="section-title">
              Тело ответа {#if log.content_type}<span class="content-type-tag">{log.content_type}</span>{/if}
            </div>
            {#if log.response_body}
              <button class="copy-small-btn" on:click={() => copyText(formattedRespBody, "resp_body")}>
                {copiedField === "resp_body" ? "Скопировано!" : "Копировать"}
              </button>
            {/if}
          </div>
          {#if log.response_body}
            <pre class="content-box">{formattedRespBody}</pre>
          {:else}
            <div class="empty-text">Тело ответа пустое или не было получено</div>
          {/if}
        </div>

      {:else if activeTab === "payload"}
        <div class="section">
          <div class="section-header-row">
            <div class="section-title">Полезная нагрузка запроса (Payload)</div>
            {#if log.request_body}
              <button class="copy-small-btn" on:click={() => copyText(formattedReqBody, "req_body")}>
                {copiedField === "req_body" ? "Скопировано!" : "Копировать"}
              </button>
            {/if}
          </div>
          {#if log.request_body}
            <pre class="content-box">{formattedReqBody}</pre>
          {:else}
            <div class="empty-text">Запрос не содержит тела (GET / HEAD или пусто)</div>
          {/if}
        </div>

      {:else if activeTab === "overview"}
        <div class="section">
          <div class="section-title">Общая сводка</div>
          <div class="kv-grid">
            <span class="key">ID записи</span>
            <span class="value code">#{log.id}</span>

            <span class="key">URL</span>
            <span class="value code break-all">{log.url}</span>

            <span class="key">Origin</span>
            <span class="value code">{log.origin || "-"}</span>

            <span class="key">Статус</span>
            <span class="value {getStatusClass(log.status, log.blocked)}">
              {log.blocked ? "DROPPED (Заблокировано)" : `${log.status} ${log.status_text || ""}`}
            </span>

            {#if log.block_reason}
              <span class="key">Сработавшее правило</span>
              <span class="value text-red">{log.block_reason}</span>
            {/if}

            <span class="key">MIME / Content-Type</span>
            <span class="value code">{log.content_type || "-"}</span>

            <span class="key">Размер ответа</span>
            <span class="value">{formatBytes(log.content_length)}</span>

            <span class="key">Длительность</span>
            <span class="value">{log.duration_ms} ms</span>

            <span class="key">Время запроса</span>
            <span class="value">{log.timestamp}</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .detail-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1050;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .detail-sheet {
    background: var(--bg-surface);
    border-top: 1px solid var(--border-subtle);
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    width: 100%;
    max-width: 800px;
    height: 82vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-subtle);
    gap: 12px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }

  .url-title {
    font-size: 0.7647rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-pill {
    font-size: 0.6471rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .status-2xx {
    background: rgba(var(--success-rgb), 0.15);
    color: var(--status-success);
  }

  .status-3xx {
    background: rgba(var(--accent-rgb), 0.15);
    color: var(--accent-primary);
  }

  .status-4xx {
    background: rgba(245, 158, 11, 0.15);
    color: var(--status-warning);
  }

  .status-5xx {
    background: rgba(var(--danger-rgb), 0.15);
    color: var(--status-danger);
  }

  .status-blocked {
    background: rgba(var(--danger-rgb), 0.25);
    color: var(--status-danger);
    border: 1px solid var(--status-danger);
  }

  .status-other {
    background: var(--bg-fill);
    color: var(--text-muted);
  }

  .method-pill {
    font-size: 0.6471rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .method-GET {
    background: rgba(var(--accent-rgb), 0.15);
    color: var(--accent-primary);
  }

  .method-POST {
    background: rgba(var(--accent-rgb), 0.15);
    color: var(--accent-primary);
  }

  .method-DELETE {
    background: rgba(var(--danger-rgb), 0.15);
    color: var(--status-danger);
  }

  .method-PUT, .method-PATCH {
    background: rgba(245, 158, 11, 0.15);
    color: var(--status-warning);
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .quick-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-app);
    border-bottom: 1px solid var(--border-subtle);
    overflow-x: auto;
  }

  .action-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 0.7059rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }

  .action-chip:hover {
    background: var(--bg-surface-2);
    color: var(--text-primary);
  }

  .action-chip img {
    width: 13px;
    height: 13px;
    filter: invert(70%);
  }

  .block-chip {
    border-color: var(--status-danger);
    color: var(--status-danger);
  }

  .block-chip:hover {
    background: rgba(var(--danger-rgb), 0.15);
  }

  .tabs-nav {
    display: flex;
    align-items: center;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-subtle);
    padding: 0 16px;
  }

  .tab-btn {
    padding: 10px 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-muted);
    font-size: 0.7647rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.15s, border-color 0.15s;
  }

  .tab-btn.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
  }

  .tab-size {
    font-size: 0.6471rem;
    opacity: 0.7;
  }

  .tab-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-primary);
  }

  .tab-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    box-sizing: border-box;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-title {
    font-size: 0.7059rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .copy-small-btn {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.6471rem;
    cursor: pointer;
  }

  .copy-small-btn:hover {
    background: var(--bg-surface-2);
  }

  .content-type-tag {
    font-size: 0.6471rem;
    text-transform: none;
    color: var(--accent-primary);
    margin-left: 6px;
  }

  .kv-grid {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 6px 12px;
    background: var(--bg-app);
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--border-subtle);
    font-size: 0.7059rem;
  }

  .key {
    color: var(--text-muted);
    font-weight: 500;
    word-break: break-word;
  }

  .value {
    color: var(--text-primary);
    word-break: break-word;
  }

  .value.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.6765rem;
  }

  .break-all {
    word-break: break-all;
  }

  .text-red {
    color: var(--status-danger);
    font-weight: 600;
  }

  .content-box {
    background: var(--bg-app);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    padding: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.6765rem;
    line-height: 1.45;
    color: var(--text-primary);
    max-height: 380px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }

  .empty-text {
    padding: 12px;
    color: var(--text-muted);
    font-size: 0.7059rem;
    font-style: italic;
  }

  .drag-handle-bar {
    display: flex;
    justify-content: center;
    padding: 8px 0 2px 0;
    width: 100%;
    cursor: grab;
  }

  .drag-handle {
    width: 36px;
    height: 4px;
    background: var(--bg-fill);
    border-radius: 2px;
  }

  @media (max-width: 600px) {
    .detail-sheet {
      height: 90vh;
      max-height: 92vh;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
    }

    .kv-grid {
      grid-template-columns: 1fr;
      gap: 3px;
    }

    .key {
      font-size: 0.6471rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .value {
      font-size: 0.7059rem;
      margin-bottom: 4px;
    }
  }
</style>

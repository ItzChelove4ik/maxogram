<script>
import { goto } from "$app/navigation";
  import {
    onMount,
    onDestroy
  } from "svelte";
  import { registerBackHandler } from "$lib/utils/backButton.js";

  import {
    platform as getPlatform
  } from "@tauri-apps/plugin-os";
  import { convertFileSrc, invoke } from "@tauri-apps/api/core";
  import {
    open
  } from "@tauri-apps/plugin-dialog";
  import {
    scan,
    cancel,
    Format,
    checkPermissions,
    requestPermissions,
    openAppSettings,
  } from "@tauri-apps/plugin-barcode-scanner";

  import { set as sessionSet, openSettingsPage, openAvatarGallery } from "$lib/stores/session";
  import { currentUserDetails } from "$lib/stores/api";
  import Icon from '$components/main/Icon.svelte';
  import { appearance, setAppearance } from '$lib/stores/appearance.js';
  import Avatar from "$components/main/Avatar.svelte";
  import SafeAvatarPickerModal from "$components/main/SafeAvatarPickerModal.svelte";
  import API, { currentUser } from "$lib/stores/api";
  import { openDigitalIdApp, openSferumApp } from "$lib/stores/webapp.js";
  import { safeAvatarMapStore } from "$lib/services/AvatarSyncManager";
  import { getSafeAvatarMediaUrl } from "$lib/services/uplink";
  import { disableMaxPlusAvatars } from "$lib/stores/avatarSettings";

  let platform;

  let contact;
  let phone;
  let name;
  let selfAvatarBusy = false;
  let selfAvatarWrapEl;
  let safeAvatarModalOpen = false;

  $: selfAvatarUrl = $currentUserDetails?.baseRawUrl || $currentUserDetails?.avatar || $currentUserDetails?.baseUrl || null;
  $: selfPhotoId = $currentUserDetails?.photoId || null;
  $: canDeleteSelfAvatar = Boolean(selfPhotoId || selfAvatarUrl);
  $: selfSafeAvatarUid = !$disableMaxPlusAvatars && $currentUser && $safeAvatarMapStore.has(Number($currentUser)) ? $safeAvatarMapStore.get(Number($currentUser)) : null;

  function openSelfAvatar(e) {
    const highResSafeUrl = selfSafeAvatarUid ? getSafeAvatarMediaUrl(selfSafeAvatarUid) : null;
    const galleryUrl = highResSafeUrl || selfAvatarUrl;
    if (galleryUrl || contact?.id) {
      const targetEl = selfAvatarWrapEl || e?.currentTarget;
      const rect = targetEl?.getBoundingClientRect?.();
      openAvatarGallery({
        initialUrl: galleryUrl,
        initialPhotoId: selfPhotoId,
        userId: contact?.id ?? $currentUser,
        isOwnProfile: true,
        canUpload: true,
        originEl: targetEl,
        originRect: rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null,
        originRadius: 50,
        onUpload: handleSelfAvatarUpload,
        onDelete: handleSelfAvatarDelete,
      });
    } else {
      handleSelfAvatarUpload();
    }
  }

  async function handleSelfAvatarUpload() {
    if (selfAvatarBusy) return null;
    selfAvatarBusy = true;
    try {
      return await $API.uploadProfilePhoto();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      selfAvatarBusy = false;
    }
  }

  async function handleSelfAvatarDelete(targetPhotoId = null, targetUrl = null) {
    if (selfAvatarBusy || !canDeleteSelfAvatar) return;
    selfAvatarBusy = true;
    try {
      await $API.deleteProfilePhoto(targetPhotoId || selfPhotoId, targetUrl || selfAvatarUrl);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      selfAvatarBusy = false;
    }
  }

  let closeScanner = null;
  let unregisterScanner = null;

  onDestroy(() => {
    if (unregisterScanner) unregisterScanner();
  });

  currentUserDetails.subscribe(updateSelf);

  function updateSelf(user) {
    if (!user || !user.names) return;
    phone = user.phone
      ? "+ " +
        user.phone.toString()[0] +
        " " +
        user.phone.toString().slice(1, 4) +
        " *** ** " +
        user.phone.toString().slice(-2, user.phone.toString().length)
      : "";
    name = user.names[0].firstName + " " + user.names[0].lastName;
    contact = user;
  }

  $: buttons = [
    [
      {
        icon: "profile.svg",
        text: "Настроить профиль",
        action: () => openSettingsPage("profile"),
      },
      {
        icon: "bell.svg",
        text: "Уведомления",
        action: () => openSettingsPage("notifications"),
      },
      {
        icon: "crypto.svg",
        text: "Защита пин-кодом",
        action: () => openSettingsPage("lock"),
      },
      {
        icon: "book.svg",
        text: "Словарь шифрования",
        action: () => openSettingsPage("dictionary"),
      },
    ],
    [
      {
        icon: "digital_id.svg",
        text: "Цифровой ID",
        action: () => openDigitalIdApp(),
      },
      {
        icon: "bot.svg",
        text: "Войти в Сферум",
        action: () => openSferumApp(),
      },
    ],
    [
      {
        icon: "logs.svg",
        text: "Сетевые логи",
        action: () => openSettingsPage("logs"),
      },
      {
        icon: "about.svg",
        text: "О приложении",
        action: () => openSettingsPage("about"),
      },
    ],
    [
      {
        icon: "phone.svg",
        text: "Плагины",
        action: () => openSettingsPage("plugins"),
      },
      {
        icon: "params.svg",
        text: "Расширенные настройки",
        action: () => openSettingsPage("advanced"),
      },
    ],
    [
      {
        icon: "devices.png",
        text: "Активные сессии",
        action: () => openSettingsPage("sessions"),
      },
      {
        icon: "logout.svg",
        text: "Сменить аккаунт",
        action: () => goto("/auth/select")
      },
    ],
  ];

  function clearAllKeys() {
    clearKeys();
  }

  async function readQRCode(filePath) {
    let url = "";
    try {
      const cleanPath = filePath.replace(/^file:\/\//, "");
      try {
        url = convertFileSrc(cleanPath);
      } catch {
        const bytes = await invoke("read_file", { path: cleanPath });
        const blob = new Blob([new Uint8Array(bytes)]);
        url = URL.createObjectURL(blob);
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);

      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
          const barcodes = await detector.detect(canvas);
          if (barcodes?.length > 0 && barcodes[0].rawValue) {
            return barcodes[0].rawValue;
          }
        } catch {}
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { default: jsQR } = await import("jsqr");
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      return code?.data || null;
    } finally {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    }
  }

  async function scanner() {
    let content = "";

    if (/android|ios/.test(platform)) {
      let cameraAllowed = await checkPermissions();

      if (cameraAllowed.includes("prompt")) await requestPermissions();
      else if (cameraAllowed === "denied") {
        alert(
          "Для сканирования QR нужно разрешение камеры." +
            "\nА зачем ещё вы это используете?",
        );
        await openAppSettings();
      }

      if ((await checkPermissions()) !== "granted") return;

      closeScanner = () => cancel();
      unregisterScanner = registerBackHandler(() => {
        if (closeScanner) closeScanner();
      });
      let scanned;
      try {
        scanned = await scan({ formats: [Format.QRCode] });
      } finally {
        closeScanner = null;
        if (unregisterScanner) {
          unregisterScanner();
          unregisterScanner = null;
        }
      }
      if (!scanned?.content) return;
      content = scanned.content;
    } else {
      const image = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Изображения",
            extensions: ["png", "jpeg", "jpg"],
          },
        ],
      });

      if (!image) return;

      const data = await readQRCode(image);

      if (!data) return alert("QR-код не найден!");

      content = data;
    }

    if (content.includes(":auth")) {
      $API.call(1, { interactive: true });
      $API.call(96, {});
      const response = await $API.call(290, { qrLink: content });
      if (response.error) alert(response.title);
    } else alert(content);
  }

  onMount(async () => {
    platform = await getPlatform();
  });
</script>

<div class="settings">
  <div class="settings-header"><h1>Настройки</h1><button class="scanner-button" type="button" on:click={scanner} aria-label="Сканировать QR-код"><Icon name="qr" size={24} /></button></div>

  <div class="info">
    <div
      class="self-avatar-wrap"
      bind:this={selfAvatarWrapEl}
    >
      <div class="self-avatar-clickable" on:click={openSelfAvatar}>
        <Avatar size={85} isSelf={true} contactId={contact?.id}/>
      </div>
      <button
        type="button"
        class="self-avatar-safe-badge"
        title="Сменить аватарку"
        on:click|stopPropagation={() => (safeAvatarModalOpen = true)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
    <span class="name">{name || "Ваш профиль"}</span>
    <span class="phone">{phone}</span>
  </div>

  <div class="buttons">
    <section class="appearance-section" aria-label="Оформление">
      <h2 class="group-heading">ОФОРМЛЕНИЕ</h2>
      <div class="appearance-control" role="group" aria-label="Тема приложения">
        <button type="button" class:chosen={$appearance === 'system'} aria-pressed={$appearance === 'system'} on:click={() => setAppearance('system')}>Система</button>
        <button type="button" class:chosen={$appearance === 'light'} aria-pressed={$appearance === 'light'} on:click={() => setAppearance('light')}>Светлая</button>
        <button type="button" class:chosen={$appearance === 'dark'} aria-pressed={$appearance === 'dark'} on:click={() => setAppearance('dark')}>Тёмная</button>
      </div>
    </section>
    {#each buttons as group, groupIndex}
      <h2 class="group-heading">{['АККАУНТ', 'СЕРВИСЫ MAX', 'ИНФОРМАЦИЯ', 'ДОПОЛНИТЕЛЬНО', 'СЕССИИ'][groupIndex]}</h2>
      <div class="group">
        {#each group as btn}
          <button type="button" on:click={btn.action} class="button">
            <span class="setting-icon"><Icon name={btn.icon === "profile.svg" ? "user" : btn.icon} size={20} /></span>
            <span class="setting-label">{btn.text}</span>
            {#if btn.isToggle}
              <div class="toggle-track" class:active={btn.toggleValue}>
                <div class="toggle-thumb" class:active={btn.toggleValue}></div>
              </div>
            {:else}
              <svg
                width="40"
                height="20"
                viewBox="0 0 40 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline
                  points="30,3 38,10 30,17"
                  stroke="#999"
                  fill="none"
                  stroke-width="3"
                />
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>

{#if safeAvatarModalOpen}
  <SafeAvatarPickerModal
    onClose={() => (safeAvatarModalOpen = false)}
  />
{/if}

<style>

  .settings {
    position: relative;
    width: 100%;

    overflow-y: auto;
    flex-grow: 1;
    min-height: 0;

    background: var(--bg-app);
    color: var(--text-primary);
    padding: 0 16px 24px;
  }

  .info {
    margin-top: 20px;
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    margin: 16px auto 0;
    padding: 20px 16px;
    background: var(--bg-surface);
    border-radius: var(--radius-card);
    max-width: 680px;
  }

  .self-avatar-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .self-avatar-clickable {
    cursor: pointer;
    transition: transform 0.14s;
  }

  .self-avatar-clickable:active {
    transform: scale(0.96);
  }

  .self-avatar-safe-badge {
    position: absolute;


    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
    transition: background 0.15s, transform 0.12s;

    width: 44px;
    height: 44px;
    right: -14px;
    bottom: -8px;
    border: 4px solid var(--bg-surface);
    background: var(--accent-primary);
    color: var(--text-on-accent);
  }

  .self-avatar-safe-badge:hover {
    background: var(--accent-primary);
    transform: scale(1.08);
  }

  .self-avatar-safe-badge:active {
    transform: scale(0.92);
  }

  .info .name {


    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 14px;
    text-align: center;
  }

  .info .phone {

    color: var(--text-muted);
    font-size: .8824rem;
    margin-top: 4px;
  }

  .buttons {
    display: flex;
    flex-direction: column;


    margin: 24px auto;
    gap: 0;
    max-width: 680px;
    font-size: 1rem;
  }

  .buttons .group {

    background: var(--bg-surface);
    background-color: var(--bg-surface);
    overflow: hidden;
    border-radius: var(--radius-card);
  }

  .buttons .group .button {
    display: flex;
    flex-direction: row;
    cursor: pointer;
    align-items: center;

    padding: 10px 14px;
    min-height: 48px;
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--text-primary);
    gap: 12px;
    text-align: left;
    font-size: 1rem;
  }



  .buttons .group .button svg {

    margin-left: 0;
  }



  .toggle-track {
    margin-left: auto;
    width: 44px;
    height: 24px;
    background: var(--bg-surface-2);
    border-radius: 12px;
    position: relative;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
  }

  .toggle-track.active {
    background: var(--accent-primary);
  }

  .toggle-thumb {
    width: 20px;
    height: 20px;
    background: var(--text-on-media);
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toggle-thumb.active {
    transform: translateX(20px);
  }
  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 8px;
    max-width: 680px;
    margin: 0 auto;
  }
  .settings-header h1 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -.02em;
  }
  .scanner-button {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--accent-primary);
  }
  .group-heading {
    font-size: .7647rem;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: .03em;
    margin: 24px 16px 8px;
  }
  .buttons .group .button + .button {
    border-top: 1px solid var(--border-card);
  }
  .buttons .group .button:active {
    background: var(--bg-hover);
  }
  .setting-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 8px;
    color: var(--accent-primary);
    background: var(--accent-subtle);
  }
  .setting-label {
    flex: 1;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  .appearance-control {
    display: flex;
    padding: 4px;
    gap: 4px;
    background: var(--bg-input);
    border-radius: 12px;
  }
  .appearance-control button {
    flex: 1;
    min-width: 0;
    padding: 6px;
    background: transparent;
    border: 0;
    border-radius: 9px;
    color: var(--text-secondary);
    font-size: .8824rem;
    font-weight: 500;
  }
  .appearance-control button.chosen {
    background: var(--bg-surface);
    color: var(--text-primary);
    box-shadow: 0 1px 4px rgba(0,0,0,.12);
  }
</style>

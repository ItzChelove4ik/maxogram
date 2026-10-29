<script>
  /**
   * Scanner — вертикальный сканирующий фон на canvas.
   * Реализует API, аналогичное используемому в примере:
   * color1/color2/color3, sweepSpeed, trail, ripple, scanline, grain,
   * vignette, mouseInteraction (repel/attract), clickEffect="ping" и т.д.
   */
  export let color1 = "#94a3b8";
  export let color2 = "#000000";
  export let color3 = "#FFFFFF";
  export let speed = 0.5;
  export let sweepSpeed = 0.25;
  export let sweepWidth = 1.6;
  export let trail = 0.5;
  export let ripple = 0.22;
  export let bandDensity = 11;
  export let glow = 0.6;
  export let scanDirection = "vertical";
  export let colorSpread = 0.7;
  export let scanline = true;
  export let scanlineIntensity = 0.5;
  export let mouseInteraction = true;
  export let clickEffect = "ping";
  export let reverse = false;
  export let scale = 1.5;
  export let frequency = 2;
  export let lineWidth = 1.2;
  export let brightness = 1;
  export let vignette = 0.3;
  export let grain = true;
  export let grainIntensity = 0.04;
  export let opacity = 1;
  export let mouseMode = "repel";
  export let mouseRadius = 0.5;
  export let mouseStrength = 0.7;
  export let intro = true;
  export let lightMode = false;

  import { onMount, onDestroy } from "svelte";

  let canvas;
  let ctx;
  let rafId = null;
  let running = true;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let t = 0;
  let lastFrame = 0;
  let introProgress = 1;
  let introStart = 0;
  let mouse = { x: -1e9, y: -1e9, active: false };
  let pings = [];

  // Меняем пропсы на числа/булевы, безопасно
  $: nSpeed = Number(speed) || 0.5;
  $: nSweepSpeed = Number(sweepSpeed) || 0.25;
  $: nSweepWidth = Number(sweepWidth) || 1.6;
  $: nTrail = Math.min(0.95, Math.max(0, Number(trail) || 0.5));
  $: nRipple = Number(ripple) || 0.22;
  $: nBandDensity = Math.min(40, Math.max(3, Number(bandDensity) || 11));
  $: nGlow = Number(glow) || 0.6;
  $: nColorSpread = Math.min(1, Math.max(0, Number(colorSpread) || 0.7));
  $: nScanlineIntensity = Number(scanlineIntensity) || 0.5;
  $: nScale = Number(scale) || 1.5;
  $: nFrequency = Number(frequency) || 2;
  $: nLineWidth = Number(lineWidth) || 1.2;
  $: nBrightness = Number(brightness) || 1;
  $: nVignette = Math.min(1, Math.max(0, Number(vignette)));
  $: nGrainIntensity = Number(grainIntensity) || 0.04;
  $: nOpacity = Math.min(1, Math.max(0, Number(opacity)));
  $: nMouseRadius = Number(mouseRadius) || 0.5;
  $: nMouseStrength = Number(mouseStrength) || 0.7;
  $: doScanline = scanline === true || scanline === "true";
  $: doGrain = grain === true || grain === "true";
  $: doIntro = intro === true || intro === "true";
  $: doMouse = mouseInteraction === true || mouseInteraction === "true";

  function hexToRgb(hex) {
    if (typeof hex !== "string") return [148, 163, 184];
    let h = hex.replace("#", "").trim();
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const num = parseInt(h, 16);
    if (isNaN(num)) return [148, 163, 184];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  $: c1 = hexToRgb(color2); // базовый фон (тёмный)
  $: c2 = hexToRgb(color1); // линии
  $: c3 = hexToRgb(color3); // блик развёртки

  function resize() {
    if (!canvas || !canvas.parentElement) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let resizeObserver = null;

  function draw(now) {
    if (!running) return;
    rafId = requestAnimationFrame(draw);

    if (!lastFrame) lastFrame = now;
    const dt = Math.min(64, now - lastFrame) / 1000;
    lastFrame = now;
    t += dt * nSpeed;

    if (introProgress < 1) {
      introProgress = Math.min(1, (now - introStart) / 1200);
    }

    const W = width;
    const H = height;

    // trail: затухание вместо полной очистки
    if (nTrail > 0) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(${c1[0]},${c1[1]},${c1[2]},${(1 - nTrail) * (1 - nTrail)})`;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
      ctx.fillRect(0, 0, W, H);
    }

    const vertical = scanDirection !== "horizontal";
    const long = vertical ? H : W;

    // Позиция развёртки
    const cycle = long / Math.max(0.02, nSweepSpeed * 60);
    let phase = (t * 1000) % cycle;
    let pos = (phase / cycle) * long;
    if (reverse) pos = long - pos;
    pos *= introProgress;

    // Мышиный сдвиг
    let mouseX = mouse.x;
    let mouseY = mouse.y;
    if (doMouse && mouse.active) {
      const mr = nMouseRadius * Math.min(W, H);
      // притяжение/отталкивание влияет на волны ниже
    }

    ctx.lineWidth = nLineWidth;
    ctx.globalCompositeOperation = "lighter";

    const bands = nBandDensity;
    const spacing = long / bands;

    for (let i = 0; i < bands; i++) {
      const baseY = i * spacing + (spacing / 2);
      const points = vertical ? W : H;
      const step = Math.max(6, points / 48);
      ctx.beginPath();
      for (let x = 0; x <= points; x += step) {
        const bx = x / points; // 0..1 поперёк
        const along = baseY;

        // волна + рябь
        let wave = Math.sin((bx * Math.PI * 2 * nFrequency) + t * 2 + i * 0.55) * (spacing * 0.16);
        wave += Math.sin((bx * 13.7) + t * 3.1 + i * 1.3) * (spacing * 0.06) * nRipple * 4;

        // влияние мыши
        if (doMouse && mouse.active) {
          const px = vertical ? x : along;
          const py = vertical ? along : x;
          const dx = px - mouseX;
          const dy = py - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mr = nMouseRadius * Math.min(W, H);
          if (dist < mr) {
            const force = (1 - dist / mr) * nMouseStrength;
            const dir = mouseMode === "attract" ? -1 : 1;
            wave += dir * force * spacing * 0.5 * Math.sin(dist / (mr * 0.35));
          }
        }

        const px = vertical ? x : along + wave;
        const py = vertical ? along + wave : x;
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      // Цвет: разброс между c2 и c3 в зависимости от близости к развёртке
      const dScan = Math.abs(baseY - pos);
      const scanInfluence = Math.max(0, 1 - dScan / (long * 0.25));
      const mix = nColorSpread * scanInfluence;
      const cr = Math.round(c2[0] + (c3[0] - c2[0]) * mix);
      const cg = Math.round(c2[1] + (c3[1] - c2[1]) * mix);
      const cb = Math.round(c2[2] + (c3[2] - c2[2]) * mix);
      const lineAlpha = (0.16 + scanInfluence * 0.5 * nGlow * 2) * nBrightness * (0.35 + 0.65 * introProgress);
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${Math.min(1, lineAlpha)})`;
      if (nGlow > 0) {
        ctx.shadowBlur = 8 * nGlow;
        ctx.shadowColor = `rgba(${cr},${cg},${cb},${0.5 * nGlow})`;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Яркая линия развёртки
    {
      const gradient = vertical
        ? ctx.createLinearGradient(0, 0, 0, H)
        : ctx.createLinearGradient(0, 0, W, 0);
      gradient.addColorStop(0, `rgba(${c3[0]},${c3[1]},${c3[2]},0)`);
      gradient.addColorStop(Math.max(0.01, Math.min(0.99, pos / long)), `rgba(${c3[0]},${c3[1]},${c3[2]},${0.85 * nBrightness})`);
      gradient.addColorStop(Math.min(1, pos / long + 0.02), `rgba(${c3[0]},${c3[1]},${c3[2]},0)`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(1, nSweepWidth);
      ctx.shadowBlur = 18 * nGlow;
      ctx.shadowColor = `rgba(${c3[0]},${c3[1]},${c3[2]},${nGlow})`;
      ctx.beginPath();
      if (vertical) {
        ctx.moveTo(0, pos);
        ctx.lineTo(W, pos);
      } else {
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, H);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineWidth = nLineWidth;
    }

    // Клик-пинги
    const now1 = now;
    pings = pings.filter((p) => now1 - p.at < 1400);
    for (const p of pings) {
      const age = (now1 - p.at) / 1400;
      const r = age * Math.min(W, H) * 0.6 * (Number(nScale) || 1.5);
      ctx.strokeStyle = `rgba(${c3[0]},${c3[1]},${c3[2]},${(1 - age) * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, r), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";

    // Скан-линии
    if (doScanline) {
      ctx.fillStyle = `rgba(0,0,0,${nScanlineIntensity * 0.35})`;
      const sl = 3;
      const off = (Math.floor((t * 12) % sl));
      for (let y = -off; y < H; y += sl) {
        ctx.fillRect(0, y, W, 1);
      }
    }

    // Зерно
    if (doGrain) {
      const g = ctx.createImageData(Math.ceil(W / 3), Math.ceil(H / 3));
      const gd = g.data;
      for (let i = 0; i < gd.length; i += 4) {
        const v = (Math.random() * 2 - 1) * 255 * nGrainIntensity;
        gd[i] = gd[i + 1] = gd[i + 2] = 128 + v;
        gd[i + 3] = 255;
      }
      const tmp = document.createElement("canvas");
      tmp.width = g.width;
      tmp.height = g.height;
      tmp.getContext("2d").putImageData(g, 0, 0);
      ctx.globalAlpha = 0.5;
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(tmp, 0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    // Виньетка
    if (nVignette > 0) {
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, `rgba(0,0,0,${nVignette})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function handlePointer(e) {
    if (!doMouse) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  }

  function handlePointerLeave() {
    mouse.active = false;
    mouse.x = -1e9;
    mouse.y = -1e9;
  }

  function handleClick(e) {
    if (clickEffect !== "ping" || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    pings.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, at: performance.now() });
  }

  function handleVisibility() {
    if (document.hidden) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!running) {
      running = true;
      lastFrame = 0;
      rafId = requestAnimationFrame(draw);
    }
  }

  onMount(() => {
    ctx = canvas.getContext("2d");
    resize();
    if (doIntro) {
      introProgress = 0;
      introStart = performance.now();
    }
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas.parentElement);
    }
    rafId = requestAnimationFrame(draw);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  });
</script>

<canvas
  bind:this={canvas}
  style="position:absolute; inset:0; width:100%; height:100%; opacity:{nOpacity}; display:block;"
  on:pointermove={handlePointer}
  on:pointerleave={handlePointerLeave}
  on:click={handleClick}
  aria-hidden="true"
></canvas>

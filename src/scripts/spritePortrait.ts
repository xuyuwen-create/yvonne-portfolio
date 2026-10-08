// 边界为独立监听区域内的比例；中央宽区域是 dead zone。
const tracking = {
  xBoundaries: [0.18, 0.36, 0.64, 0.82],
  yBoundaries: [0.3, 0.7],
  hysteresis: 0.025,
  frontColumn: 2,
  frontRow: 1,
  touchResetDelay: 900,
};

export function selectBand(
  position: number,
  current: number,
  boundaries: number[],
  hysteresis: number,
) {
  let band = current;
  while (band < boundaries.length && position > boundaries[band] + hysteresis) band++;
  while (band > 0 && position < boundaries[band - 1] - hysteresis) band--;
  return band;
}

document.querySelectorAll<HTMLImageElement>('[data-tracking-portrait]').forEach((portrait) => {
  const frameSources: string[] = JSON.parse(portrait.dataset.frames ?? '[]');
  if (frameSources.length !== 15) return;
  // 保留已解码图片引用；全部就绪后才启用跟随，避免首次切帧闪白。
  const loadedFrames = frameSources.map((src) => {
    const image = new Image();
    image.src = src;
    return image;
  });
  let ready = false;
  const scene = portrait.closest<HTMLElement>('.scene');
  const area = scene?.querySelector<HTMLElement>('[data-portrait-area]');
  let areaBounds = area?.getBoundingClientRect();
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let column = tracking.frontColumn;
  let row = tracking.frontRow;
  let point: { x: number; y: number } | null = null;
  let frame = 0;
  let touchPointer: number | null = null;
  let touchResetTimer = 0;

  function enabled() {
    return (
      ready &&
      !reducedMotion.matches &&
      !document.hidden &&
      document.hasFocus() &&
      !scene?.hidden &&
      !scene?.inert
    );
  }

  function paint() {
    const frameIndex = row * 5 + column;
    const src = frameSources[frameIndex];
    if (portrait.getAttribute('src') !== src) portrait.src = src;
  }

  function update() {
    frame = 0;
    if (!point || !enabled()) return;
    const nextColumn = selectBand(point.x, column, tracking.xBoundaries, tracking.hysteresis);
    const nextRow = selectBand(point.y, row, tracking.yBoundaries, tracking.hysteresis);
    if (nextColumn === column && nextRow === row) return;
    column = nextColumn;
    row = nextRow;
    paint();
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || !finePointer.matches || !enabled()) return;
    const bounds = areaBounds;
    if (
      !bounds ||
      bounds.width <= 0 ||
      bounds.height <= 0 ||
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      if (point || frame || column !== tracking.frontColumn || row !== tracking.frontRow) reset();
      return;
    }
    point = {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
    if (!frame) frame = requestAnimationFrame(update);
  }

  function reset() {
    window.clearTimeout(touchResetTimer);
    touchResetTimer = 0;
    touchPointer = null;
    cancelAnimationFrame(frame);
    frame = 0;
    point = null;
    column = tracking.frontColumn;
    row = tracking.frontRow;
    paint();
  }

  function sync() {
    stopListening();
    areaBounds = area?.getBoundingClientRect();
    const listening = enabled() && finePointer.matches && !!scene?.matches(':hover');
    if (listening) scene?.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  function stopListening() {
    scene?.removeEventListener('pointermove', onPointerMove);
    reset();
  }

  scene?.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || !enabled()) return;
    areaBounds = area?.getBoundingClientRect();
    scene.addEventListener('pointermove', onPointerMove, { passive: true });
    onPointerMove(event);
  });
  // 触摸使用屏幕坐标；被动监听，不截获点击或原生滚动。
  function trackTouch(event: PointerEvent) {
    point = {
      x: Math.max(0, Math.min(1, event.clientX / window.innerWidth)),
      y: Math.max(0, Math.min(1, event.clientY / window.innerHeight)),
    };
    if (!frame) frame = requestAnimationFrame(update);
  }
  scene?.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType !== 'touch' || !event.isPrimary || !enabled()) return;
      if ((event.target as Element).closest('button, a, input, select, textarea, [role="button"]'))
        return;
      window.clearTimeout(touchResetTimer);
      touchPointer = event.pointerId;
      trackTouch(event);
    },
    { passive: true },
  );
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerId !== touchPointer || !enabled()) return;
      trackTouch(event);
    },
    { passive: true },
  );
  window.addEventListener(
    'pointerup',
    (event) => {
      if (event.pointerId !== touchPointer) return;
      touchPointer = null;
      touchResetTimer = window.setTimeout(reset, tracking.touchResetDelay);
    },
    { passive: true },
  );
  window.addEventListener(
    'pointercancel',
    (event) => {
      if (event.pointerId === touchPointer) reset();
    },
    { passive: true },
  );
  const onMouseLeave = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') stopListening();
  };
  scene?.addEventListener('pointerleave', onMouseLeave);
  document.documentElement.addEventListener('pointerleave', onMouseLeave);
  window.addEventListener('pointerout', (event) => {
    if (event.pointerType === 'mouse' && !event.relatedTarget) stopListening();
  });
  window.addEventListener('blur', stopListening);
  window.addEventListener('focus', sync);
  window.addEventListener('resize', sync);
  document.addEventListener('visibilitychange', sync);
  finePointer.addEventListener('change', sync);
  reducedMotion.addEventListener('change', sync);
  if (scene) {
    new MutationObserver(sync).observe(scene, {
      attributes: true,
      attributeFilter: ['hidden', 'inert'],
    });
  }
  if (area) new ResizeObserver(sync).observe(area);
  sync();
  void Promise.all(loadedFrames.map((image) => image.decode()))
    .then(() => {
      ready = true;
      sync();
    })
    .catch(() => {
      // 某帧加载失败时保持正面，避免切换到缺失图片。
      ready = false;
      sync();
    });
});

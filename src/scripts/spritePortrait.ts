// 边界为 viewport 的比例；中央宽区域是 dead zone，缓冲区防止边缘闪烁。
const tracking = {
  xBoundaries: [0.18, 0.36, 0.64, 0.82],
  yBoundaries: [0.3, 0.7],
  hysteresis: 0.025,
  frontColumn: 2,
  frontRow: 1,
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
  const area = scene?.querySelector<HTMLElement>('.scene-menu');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let column = tracking.frontColumn;
  let row = tracking.frontRow;
  let point: { x: number; y: number } | null = null;
  let frame = 0;
  let listening = false;

  function enabled() {
    return (
      ready &&
      finePointer.matches &&
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
    if (event.pointerType !== 'mouse' || !enabled()) return;
    point = {
      x: Math.max(0, Math.min(1, event.clientX / Math.max(1, innerWidth))),
      y: Math.max(0, Math.min(1, event.clientY / Math.max(1, innerHeight))),
    };
    if (!frame) frame = requestAnimationFrame(update);
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    point = null;
    column = tracking.frontColumn;
    row = tracking.frontRow;
    paint();
  }

  function sync() {
    stopListening();
    listening = enabled() && !!area?.matches(':hover');
    if (listening) area?.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  function stopListening() {
    area?.removeEventListener('pointermove', onPointerMove);
    listening = false;
    reset();
  }

  area?.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' || !enabled()) return;
    listening = true;
    area.addEventListener('pointermove', onPointerMove, { passive: true });
    onPointerMove(event);
  });
  area?.addEventListener('pointerleave', stopListening);
  document.documentElement.addEventListener('pointerleave', stopListening);
  window.addEventListener('pointerout', (event) => {
    if (!event.relatedTarget) stopListening();
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

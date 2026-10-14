// All entrance timing lives here; the composition stays fixed throughout.
const entrance = {
  lidDelay: 180,
  lidDuration: 700,
  contentsDelay: 650,
  contentsDuration: 680,
  contentsStagger: 18,
  contentsStartScale: 0.14,
  contentsOvershoot: 0.055,
  monsterDelay: 1600,
  monsterDuration: 1800,
  loadTimeout: 8000,
};
const collection = document.querySelector<HTMLElement>('#skills-collection');
const main = document.querySelector<HTMLElement>('[data-collection-page]');
const control = document.querySelector<HTMLButtonElement>('[data-intro-control]');
const status = document.querySelector<HTMLElement>('[data-intro-status]');
const motion = matchMedia('(prefers-reduced-motion: reduce)');

if (collection && main && control && status) {
  const stage = collection.querySelector<HTMLElement>('.collection__stage')!;
  const lid = collection.querySelector<HTMLElement>('.collection__lid')!;
  const monster = collection.querySelector<HTMLElement>('[data-monster]')!;
  const contents = Array.from(
    collection.querySelectorAll<HTMLElement>('.collection__item:not([data-monster])'),
  );
  let animations: Animation[] = [];
  let ready = false;
  let cancelled = false;
  let running = false;
  let run = 0;

  const finish = () => {
    run++;
    running = false;
    collection.dataset.phase = 'ready';
    animations.forEach((animation) => animation.cancel());
    animations = [];
    stage.inert = false;
    control.textContent = 'もう一度見る';
    control.hidden = !ready || motion.matches;
    status.textContent = '気になるアイテムを選んでください。';
  };
  const play = async () => {
    if (!ready || motion.matches) {
      finish();
      return;
    }
    collection.querySelector<HTMLButtonElement>('[data-collection-close]:not([hidden])')?.click();
    const currentRun = ++run;
    running = true;
    stage.inert = true;
    collection.dataset.phase = 'intro';
    const monsterAngle = parseFloat(getComputedStyle(monster).getPropertyValue('--angle')) || 0;
    control.hidden = false;
    control.textContent = 'イントロをスキップ';
    status.textContent = '缶が開いて、小さな怪獣がやってきます。';
    animations = [
      lid.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg) scale(1)', zIndex: 40 },
          { transform: 'translate(-8%, -22%) rotate(10deg) scale(0.94)', zIndex: 40, offset: 0.45 },
          { transform: 'translate(-23%, -32%) rotate(24deg) scale(0.78)', zIndex: -1 },
        ],
        {
          delay: entrance.lidDelay,
          duration: entrance.lidDuration,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      ),
      ...contents.map((item, index) => {
        const bounds = item.getBoundingClientRect();
        const dx = innerWidth / 2 - (bounds.left + bounds.width / 2);
        const dy = innerHeight / 2 - (bounds.top + bounds.height / 2);
        const overshoot = entrance.contentsOvershoot;
        return item.animate(
          [
            { opacity: 0, translate: `${dx}px ${dy}px`, scale: entrance.contentsStartScale },
            { opacity: 1, translate: `${dx * 0.8}px ${dy * 0.8}px`, scale: 0.3, offset: 0.12 },
            {
              opacity: 1,
              translate: `${-dx * overshoot}px ${-dy * overshoot}px`,
              scale: 1.025,
              offset: 0.72,
            },
            { opacity: 1, translate: `${dx * 0.018}px ${dy * 0.018}px`, scale: 0.99, offset: 0.9 },
            { opacity: 1, translate: '0 0', scale: 1 },
          ],
          {
            delay: entrance.contentsDelay + index * entrance.contentsStagger,
            duration: entrance.contentsDuration,
            easing: 'cubic-bezier(0.22, 0.8, 0.3, 1)',
            fill: 'both',
          },
        );
      }),
      monster.animate(
        [
          {
            transform: `translateX(90%) translateY(0) rotate(${monsterAngle + 16}deg)`,
            opacity: 0,
          },
          {
            transform: `translateX(68%) translateY(-4px) rotate(${monsterAngle + -4}deg)`,
            opacity: 1,
            offset: 0.15,
          },
          {
            transform: `translateX(42%) translateY(0) rotate(${monsterAngle + 13}deg)`,
            opacity: 1,
            offset: 0.3,
          },
          {
            transform: `translateX(16%) translateY(-4px) rotate(${monsterAngle + -4}deg)`,
            opacity: 1,
            offset: 0.45,
          },
          {
            transform: `translateX(-10%) translateY(0) rotate(${monsterAngle + 13}deg)`,
            opacity: 1,
            offset: 0.6,
          },
          {
            transform: `translateX(-36%) translateY(-3px) rotate(${monsterAngle + -4}deg)`,
            opacity: 1,
            offset: 0.75,
          },
          {
            transform: `translateX(-50%) translateY(0) rotate(${monsterAngle + 3}deg)`,
            opacity: 1,
            offset: 0.9,
          },
          {
            transform: `translateX(-50%) translateY(0) rotate(${monsterAngle + 0}deg)`,
            opacity: 1,
          },
        ],
        {
          delay: entrance.monsterDelay,
          duration: entrance.monsterDuration,
          easing: 'linear',
          fill: 'both',
        },
      ),
    ];
    try {
      await Promise.all(animations.map((animation) => animation.finished));
      if (run === currentRun) finish();
    } catch {
      // Skip, reduced-motion or page departure cancelled this run.
      if (run === currentRun) finish();
    }
  };
  const preload = (url: string) =>
    new Promise<void>((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(
        () => reject(new Error('Image load timeout')),
        entrance.loadTimeout,
      );
      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image unavailable'));
      };
      img.src = url;
    });
  control.hidden = false;
  control.addEventListener('click', () => {
    if (running || !ready) {
      cancelled = true;
      finish();
    } else void play();
  });
  motion.addEventListener('change', () => {
    if (motion.matches) {
      cancelled = true;
      finish();
    } else control.hidden = !ready;
  });
  window.addEventListener('pagehide', () => {
    cancelled = true;
    finish();
  });
  if (motion.matches) finish();
  else {
    collection.dataset.phase = 'loading';
    stage.inert = true;
    status.textContent = '画像を読み込んでいます。';
  }
  Promise.all(
    Array.from(collection.querySelectorAll<HTMLImageElement>('img'), (image) => preload(image.src)),
  )
    .then(() => {
      ready = true;
      if (!cancelled && !motion.matches) void play();
      else finish();
    })
    .catch(() => {
      finish();
      status.textContent = 'イントロを省略しました。文字版でもスキルをご覧いただけます。';
    });
}

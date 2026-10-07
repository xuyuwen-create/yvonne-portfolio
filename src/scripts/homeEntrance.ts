// 首次入场独立于场景切换；translate 不覆盖组件已有的 transform。
const entrance = {
  titleDuration: 620,
  titleStagger: 55,
  titleRise: 48,
  contentPause: 100,
  contentDuration: 600,
  contentStagger: 45,
  contentDistance: 36,
};

const root = document.documentElement;
const home = document.querySelector<HTMLElement>('#home-scene');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const animations: Animation[] = [];

if (home && !home.hidden && !motion.matches) {
  const lines = home.querySelectorAll<HTMLElement>('.home__title > span');
  const originalLines = Array.from(lines, (line) => line.textContent ?? '');
  const titles: HTMLElement[] = [];
  lines.forEach((line) => {
    const characters = Array.from(line.textContent ?? '', (character) => {
      const span = document.createElement('span');
      span.className = 'home__title-character';
      span.textContent = character;
      titles.push(span);
      return span;
    });
    line.replaceChildren(...characters);
  });
  const contentDelay =
    entrance.titleDuration +
    Math.max(0, titles.length - 1) * entrance.titleStagger +
    entrance.contentPause;
  titles.forEach((title, index) => {
    animations.push(
      title.animate(
        [
          { opacity: 0, translate: `0 ${entrance.titleRise}px`, offset: 0 },
          { opacity: 1, translate: '0 -7px', offset: 0.7 },
          { opacity: 1, translate: '0 0', offset: 1 },
        ],
        {
          duration: entrance.titleDuration,
          delay: index * entrance.titleStagger,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      ),
    );
  });

  const elements = document.querySelectorAll<HTMLElement>(
    '.home__eyebrow, .home__intro, .home__portrait, .scene-menu__entry, .app__brand, .app__edition, .app__footer > span',
  );
  const portrait = home.querySelector<HTMLElement>('.home__portrait');
  const portraitBounds = portrait?.getBoundingClientRect();
  const menuCenter = portraitBounds
    ? portraitBounds.left + portraitBounds.width / 2
    : innerWidth / 2;

  elements.forEach((element, index) => {
    const bounds = element.getBoundingClientRect();
    const center = element.matches('.scene-menu__entry') ? menuCenter : innerWidth / 2;
    const direction = bounds.left + bounds.width / 2 < center ? -1 : 1;
    animations.push(
      element.animate(
        [
          { opacity: 0, translate: `${direction * entrance.contentDistance}px 0` },
          { opacity: 1, translate: '0 0' },
        ],
        {
          duration: entrance.contentDuration,
          delay: contentDelay + index * entrance.contentStagger,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      ),
    );
  });

  delete root.dataset.homeEntrance;
  const finish = () => {
    animations.forEach((animation) => animation.cancel());
    lines.forEach((line, index) => {
      line.textContent = originalLines[index];
    });
    document.removeEventListener('pointerdown', finish, true);
    document.removeEventListener('focusin', finish, true);
    motion.removeEventListener('change', finish);
  };
  document.addEventListener('pointerdown', finish, true);
  document.addEventListener('focusin', finish, true);
  motion.addEventListener('change', finish);
  void Promise.allSettled(animations.map((animation) => animation.finished)).then(finish);
}

const skills = document.querySelector<HTMLElement>('#skills-scene');
const skillsTitle = document.querySelector<HTMLElement>('#skills-title');
const home = document.querySelector<HTMLElement>('#home-scene');
const experience = document.querySelector<HTMLElement>('#experience-scene');
const experienceTitle = document.querySelector<HTMLElement>('#experience-title');
const projects = document.querySelector<HTMLElement>('#projects-scene');
const interests = document.querySelector<HTMLElement>('#interests-scene');
const interestsTitle = document.querySelector<HTMLElement>('#interests-title');
const pending = document.querySelector<HTMLElement>('#pending-scene');
const menuButtons = document.querySelectorAll<HTMLButtonElement>('[data-scene]');
const backButtons = document.querySelectorAll<HTMLButtonElement>('[data-back-home]');
const projectTitle = document.querySelector<HTMLElement>('#projects-title');
const pendingTitle = document.querySelector<HTMLElement>('#pending-title');

if (
  home &&
  skills &&
  skillsTitle &&
  experience &&
  experienceTitle &&
  projects &&
  pending &&
  interests &&
  interestsTitle &&
  projectTitle &&
  pendingTitle
) {
  let switching = false;
  let activeScene = projects;
  let returnButton: HTMLButtonElement | null = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  async function switchScene(entering: boolean) {
    // 忽略动画期间的重复点击，避免两个场景状态交错。
    if (switching || (!entering && !home!.hidden)) return;
    switching = true;
    const outgoing = entering ? home! : activeScene;
    const incoming = entering ? activeScene : home!;
    const direction = entering ? 1 : -1;
    const styles = getComputedStyle(document.documentElement);
    const distance = styles.getPropertyValue('--scene-distance').trim();
    const duration = reducedMotion.matches
      ? 0
      : parseFloat(styles.getPropertyValue('--scene-duration'));
    const easing = styles.getPropertyValue('--scene-easing').trim();

    outgoing.inert = true;
    incoming.hidden = false;
    // 两个场景在同一 Grid 单元交叠；返回时反转移动方向。
    const animations =
      duration > 0
        ? [
            outgoing.animate(
              [
                { opacity: 1, transform: 'translateX(0)' },
                { opacity: 0, transform: `translateX(calc(${distance} * ${-direction}))` },
              ],
              { duration, easing, fill: 'both' },
            ),
            incoming.animate(
              [
                { opacity: 0, transform: `translateX(calc(${distance} * ${direction}))` },
                { opacity: 1, transform: 'translateX(0)' },
              ],
              { duration, easing, fill: 'both' },
            ),
          ]
        : [];

    try {
      await Promise.all(animations.map((animation) => animation.finished));
    } finally {
      outgoing.hidden = true;
      incoming.inert = false;
      animations.forEach((animation) => animation.cancel());
      const focusTarget = entering
        ? activeScene === experience
          ? experienceTitle!
          : activeScene === projects
            ? projectTitle!
            : activeScene === interests
              ? interestsTitle!
              : activeScene === skills
                ? skillsTitle!
                : pendingTitle!
        : returnButton;
      focusTarget?.focus({ preventScroll: true });
      switching = false;
    }
  }

  menuButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (switching) return;
      activeScene =
        button.dataset.scene === 'experience'
          ? experience!
          : button.dataset.scene === 'projects'
            ? projects!
            : button.dataset.scene === 'interests'
              ? interests!
              : button.dataset.scene === 'skills'
                ? skills!
                : pending!;
      returnButton = button;
      void switchScene(true);
    });
  });
  backButtons.forEach((button) => {
    button.addEventListener('click', () => void switchScene(false));
  });
}

# Yvonne 个人作品集

最小 Astro 静态项目。首页是全屏场景，五个菜单围绕分层人像排列；点击“工作项目”进入示例场景，点击“返回首页”返回。其余入口暂不切换。

## 本地运行

```sh
npm install
npm run dev
```

打开终端显示的地址（默认 http://localhost:4321）。检查和预览构建产物：

```sh
npm run build
npm run preview
```

## 文件与调整

导航图标现在使用剪纸 PNG：`SceneMenu.astro` 中 `iconSrc` 指向 `/images/icons/{id}.png`，图片使用空 `alt`，由旁边名称提供说明。统一容器采用 `object-fit: contain`，各入口的 `--icon-scale` 调视觉大小。原始 1254px 素材保留在 `public/images/`；优化版位于 `public/images/icons/`，裁去多余透明留白、保留边缘余量并缩为 128 × 128 全色透明 PNG。手机沿用 22px 容器，位置、弹出动画与点击逻辑不变。

首页采用海报式不对称布局：桌面左侧 40% 为两行粗体标题和简介，彩色人像在 71% 的横向位置贴底，导航分布在右侧区域。`--home-copy-width`、`--home-title-size`、`--home-portrait-x` 集中控制构图。900px 以下改为上方标题、下方人像与导航；窄而矮的窗口使用独立紧凑布局，通过容器单位限制人像尺寸，保留文字可读性。菜单弹出、人像跟随和场景切换逻辑不变。

人像只在鼠标进入 `.scene-menu` 区域时绑定移动监听，离开后移除监听并平滑回正；标题区和菜单区域外不会驱动跟随。跟随幅度、平滑参数和场景切换保持原有设置。

`.app__brand` 的右边线复用 Header 的线宽和颜色，`padding-right: var(--space-md)` 控制文字与边线的间距。

Header 的上下细边线位于 `global.css` 的 `.app__header`；`--header-border-width` 控制线宽，`--header-padding-block` 控制上下内边距，颜色复用 `--color-border`。矮屏会减小内边距。

首页当前采用“彩色拼贴人像＋黑白剪纸导航”：白色背景、黑白小盒子导航，无宇宙装饰。首页主题通过 `.app:has(#home-scene:not([hidden]))` 限定，内页保留原配色。菜单变量 `--menu-*` 调间距、位置和字体，`--icon-scale` 调整各图标的视觉大小；图标在左、名称在右；悬停或键盘聚焦时内容向上弹出，盒子和点击范围固定。`--menu-pop-distance` 和 `--menu-pop-duration` 控制弹出距离与时间；触屏保持默认，减少动态效果模式关闭弹出。`UniverseBackdrop.astro` 保留为未使用的旧装饰组件。

菜单使用透明剪纸 PNG 图标，不依赖图标库。`global.css` 中 `--portrait-scale: 1.728` 控制人像放大比例。窄屏与矮屏使用独立基准尺寸，再应用同一个比例。人像跟随参数、校准和场景动画不受这些样式调整影响。

代码格式化使用 Prettier 和 Astro 插件。VS Code 中安装推荐扩展 `Prettier - Code formatter` 和 `Astro` 后，保存文件会自动格式化。

```sh
npm run format        # 格式化源码、配置和文档
npm run format:check  # 只检查格式
```

规则在 `.prettierrc.json`：2 空格缩进、JS/TS 单引号、保留分号、每行目标长度 100 字符。`.prettierignore` 排除构建产物、依赖和静态资源。请修改 `src/` 中的源码；`dist/` 是构建产物，重新构建会覆盖。

- `src/pages/index.astro`：首页结构、标题、组件组合。
- `src/components/Portrait.astro`：分层人像、鼠标跟随和开发时的母版对照开关。
- `src/components/SceneMenu.astro`：五个菜单入口，`entries` 管理名称和场景标识。
- `src/components/UniverseBackdrop.astro`：旧版装饰，当前首页未引用。
- `src/components/ProjectsScene.astro`：工作项目示例内容和返回按钮。
- `src/scripts/scenes.ts`：进入、返回动画及焦点管理，防止连续点击导致状态错乱。
- `src/styles/global.css`：全局主题、全屏布局和响应式 CSS 变量。
- `astro.config.mjs` / `tsconfig.json`：Astro 默认配置 / 严格 TypeScript 配置。
- `package.json` / `package-lock.json`：命令、依赖及锁定版本。
- `AGENTS.md`：开发约定；`TODO.md`：后续待办。

`.app` 用 `100svh` 和三行 Grid 划分页眉、场景、页脚；中间行 `minmax(0, 1fr)` 避免撑高页面。`.home__stage` 是定位容器，人像使用 `50%` + `translate` 居中，菜单通过百分比位置分布在左、上、右。调颜色看 `--color-*`；调人像看 `--portrait-*`；调入口大小、间距和位置看 `--menu-*`、`--icon-size`。媒体查询覆盖变量以适配手机与矮屏。

场景位于 `.scenes` 的同一 Grid 单元，通过原生 Web Animations API 淡入淡出并横向移动。`--scene-duration`、`--scene-distance`、`--scene-easing` 控制时长、距离和节奏。切换结束后隐藏旧场景；`inert` 防止隐藏或切换中的内容获取焦点，进入后焦点移到标题，返回后恢复到工作项目按钮。系统开启“减少动态效果”时直接切换。小屏项目内容可在场景内滚动，不通过滚轮切换场景。

项目采用 [Astro 官方手动初始化方式](https://docs.astro.build/en/install-and-setup/)。无 UI 框架、后端或部署配置。

人像参数集中在 `Portrait.astro` 顶部：`alignment` 控制素材对齐，`tracking` 控制头部偏移、倾斜、瞳孔移动和平滑。坐标统一为 1086 × 1448 素材像素。`headX/headY/headTilt` 的安全上限为 4/2/0.45，保留头颈覆盖；`pupilX/pupilY` 默认 9/6，眼白裁切防止瞳孔越界；`smoothMs` 越大跟随越慢。只有鼠标设备启用跟随，触屏和减少动画模式保持默认姿态。离开窗口或首页会回正，母版对照时暂停跟随。

首页人像居中贴视窗底边，场景区域延伸至底部；页脚叠放且保留可读底色，工作项目内容仍避开页脚。窄屏和矮屏沿用各自的尺寸基准；开发用母版对照开关移至人像内部底边。

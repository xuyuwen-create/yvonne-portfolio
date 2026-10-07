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

截图存在性从构建工作目录的 `public/` 检查，避免 Astro 打包后 `import.meta.url` 改变造成 CI 把已有图片误判为缺失；输出 URL 仍通过 `withBase()` 加仓库前缀。

所有类别的项目数据直接放在 `categories` 内对应的 `projects` 数组中，通信类别不再引用单独的顶层 projects 变量。

自主制作追加「WordPress・ACF 学習制作」，状态为「制作中・近日公開」。文案区分已有 WordPress 制作经验与正在学习 ACF，不列未确认技术成果或公开链接；`status` 为可选字段，现有完成项目不显示制作中状态。

GitHub Pages 部署：仓库 `xuyuwen-create/yvonne-portfolio`，站点地址 `https://xuyuwen-create.github.io/yvonne-portfolio/`。Astro 使用静态输出，`site` 和 `base` 已配置；`.github/workflows/deploy.yml` 按 Astro 官方文档使用官方 Action 构建、上传并部署，推送到 `main` 或手动运行时触发。GitHub Settings → Pages → Source 选择 GitHub Actions。提交时包含 `package-lock.json`；无需提交 dist。配置本身不会推送或部署。

本地运行 `npm run dev` 或构建后 `npm run preview`，访问终端地址下的 `/yvonne-portfolio/`。当前功能分支需先合入 main 才会触发自动部署。

标题「の世界へ／ようこそ」使用 YVONNE 字号的 65%，通过 `--title-welcome-scale` 调整，随现有响应式字号一起缩放。

首页标题文案为「YVONNE の世界へようこそ」，按 YVONNE／の世界へ／ようこそ 三行显示，保留深紫星空效果。

GitHub Pages 路径兼容：`src/utils/paths.ts` 的 `withBase()` 为人像、图标与项目图片加上 Astro `BASE_URL`；图片存在性仍按本地 public 路径检查。系统字体、内嵌纸纹和场景按钮不依赖站点根路径。Astro 显式使用 `output: 'static'`。

Header 的 YVONNE 与ポートフォリオ复用星空文字效果，保留返回首页功能。当前背景采用深蓝紫星云：`.app::before` 显示紫蓝、青蓝云雾的缓慢翻滚，`.app::after` 叠加稀疏细星点并缓慢漂移；`--stars-opacity` / `--stars-duration` 调星点浓度和速度。减少动画模式保持静态，背景不监听鼠标。

自主制作项目缩略图由用户提供的 `personal-portfolio.png` 生成，裁掉底部 66px 开发工具区域，保留标题、导航和人像主体，输出为 `public/images/projects/personal-portfolio.webp`；原 PNG 保留。

导航宽度按自身容器约束，桌面两侧入口保持安全边距；手机与竖屏平板统一三列上排、两侧下排，保留至少 80px 的行间距及状态标记空间。小屏按钮至少 56px 高，日文可换行，hover 和键盘聚焦不弹出内容，但状态与焦点边框保留。

Header 品牌文字可点击返回首页，复用现有切页动画；首页点击保持当前画面，支持键盘操作和焦点提示。

「準備中」的显示直接由按钮 `:hover` / `:focus-visible` 控制，不依赖精细指针媒体查询；小屏禁用弹出动画的规则不影响状态文字显示。

首页四个未完成入口在鼠标悬停或键盘聚焦时显示「準備中」，标记由按钮盒子的 `::after` 伪元素生成，绝对定位在盒子下方，不占用名称布局、不随名称弹出，按钮 `aria-label` 提供准备中状态，触屏点击后进入准备中界面。统一进入 `PendingScene.astro`，只包含准备中说明和返回按钮。制作実績保持开放；两种场景复用原切页动画，返回后焦点回到原入口。

`CursorGlow.astro` 是独立的全视窗 Canvas 装饰层，保留系统光标且不拦截点击。顶部 `config` 集中控制紫色、光点半径、尾迹半径、400ms 消散时间、采样间距和最多 100 个尾迹点；rAF 绘制、插值连接快速移动路径，停止后只保留光点并停止更新。离窗或失焦清空，触屏及减少动画模式禁用，不修改人像和场景逻辑。

自主制作类别展示当前作品集网站，附制作要点与 Codex、AI 素材使用说明；实际使用 Astro、HTML、CSS、JavaScript 和 TypeScript。项目 `url` 可选，未提供时不渲染链接。`points`、`process` 管理可选制作说明，截图路径为 `public/images/projects/personal-portfolio.webp`。

ポイントバックキャンペーン项目使用用户指定的品牌介绍图，本地 WebP 为 `public/images/projects/wacoal-pointback.webp`，保留原图比例，alt 标注为介绍图片。

総合開業相談窓口 LP 的真实页面截图位于 `public/images/projects/itscom-open-support.webp`，由用户提供的 PNG 优化为 1200 × 900 WebP，保留完整画面；原始 PNG 保留。

わんわんパラダイス项目使用用户指定的 OGP 介绍图，本地文件为 `public/images/projects/wanwanparadise.webp`，保持原图比例，alt 标注为介绍图片。

GOCOCi 项目使用用户指定的品牌介绍图，本地 WebP 为 `public/images/projects/wacoal-gococi.webp`，保持原图比例，alt 标注为介绍图片。

ワコール「マタニティアイテムランキング」使用用户指定的品牌介绍图，本地文件为 `public/images/projects/wacoal-maternity-ranking.webp`，保持原图比例，alt 标注为介绍图片。

une nana cool「my custom」项目使用用户指定的品牌介绍图，本地文件为 `public/images/projects/unenanacool-mycustom.webp`，保留 1200 × 630 原图比例，alt 标注为介绍图片。

Zoff 项目使用品牌提供的 OGP 介绍图，来源为 `https://www.zoff.co.jp/img/ogp/contents/beautyprep/beautyprep_ogp.jpg`，本地 WebP 位于 `public/images/projects/zoff-beautyprep.webp`，保持原图比例。其 alt 标注为介绍图片，不称作页面截图。

类别列表使用透明底的目录行：细分隔线、编号、类别名称、说明与箭头，不使用圆角卡片。桌面标题与说明并排，手机说明排在名称下方；整行可点击，键盘焦点保留。

制作实绩按“类别 → 类别内项目”浏览，当前包含通信サービス（两个 iTSCOM 项目）和ファッション・ライフスタイル（Zoff、une nana cool my custom、ワコール マタニティランキング、GOCOCi、ポイントバックキャンペーン，共五个项目）、ペット・旅行（ワンコnowa わんわんパラダイス）。单项目类别隐藏前后按钮，保留页码和返回入口。项目截图在构建时检查指定的 `public/images/projects/` 文件，文件不存在时显示明确占位；放入截图后重新构建即可显示。`ProjectsScene.astro` 顶部的 `categories` 管理类别名称、说明和项目数组；项目数据包含职责、可选技术、截图和 URL；未确认技术的项目不显示使用技術栏。类别内保留分页与首页返回，カテゴリ一覧へ 返回并恢复焦点；再次从首页进入时显示类别列表。

制作实绩展示两个イッツコム编码项目，每次显示一张卡片。前后按钮在边界禁用，页码通过 live region 播报；按钮支持原生键盘操作，到边界时将焦点交给可操作按钮。项目链接在新标签页打开，截图未提供时明确显示占位。正文 1rem，职责和技术至少 0.875rem；窄屏上下排版，内容超出时由项目场景滚动。项目资料集中在 `ProjectsScene.astro` 顶部，保留既有场景进入、返回逻辑。

首页标题的深紫渐变内叠加三层细小星点，沿不同方向漂移，并以 `title-twinkle` 缓慢改变星点分布，形成星空闪动感。所有图层均裁切在文字内，减少动画模式下静止，不影响页面背景或交互。

首页 `.home__title` 使用只裁切在文字笔画内的深紫流光渐变。`--title-purple-deep`、`--title-purple-mid`、`--title-purple-light` 控制颜色，`--title-shimmer-duration` 控制流动速度；减少动画模式显示静态渐变，不支持文字裁切时回退为深紫纯色。字号、布局和页面背景不变。

背景以深蓝紫为底，紫蓝与青蓝云雾通过 `--glow-opacity: 0.75` 和 `--glow-duration: 28s` 控制浓度、翻滚速度。正文、标题和细边线同步提高对比度。

背景仅按 `--glow-duration` 自动漂移，不监听鼠标；光标尾光和人像跟随保持独立。

App 外层、首页和工作项目统一使用浅色流光渐变、黑灰文字与浅灰边框，颜色由 `global.css` 的 `:root` 变量管理。场景切换不再更换主题；项目卡片使用简洁边框，移除纸纹、剪纸边缘和阴影。Header 沿用系统字体，保留已有上下边线与品牌右边线。

流光背景由 `.app::before` 的四层径向渐变构成，自动翻滚且不拦截鼠标事件。`--glow-lilac`、`--glow-rose`、`--glow-aqua`、`--glow-gold` 调整颜色，`--glow-opacity` 调整浓度，`--glow-duration` 调整速度；减少动画模式下保持静态。背景鼠标监听脚本已移除。

在 `max-width: 900px` 且 `min-height: 521px` 时，导航禁用 hover 的弹出、倾斜和边框变化，点击功能与键盘焦点边框保留。

首页导航使用 `kv_btns.png` 经 imagegen 去字、去背景后裁出的果冻素材，位于 `public/images/jelly-buttons/`。每个入口有 default、hover、active 三张 WebP，HTML 文字独立显示。`SceneMenu.astro` 的 `--jelly-default` / `--jelly-hover` / `--jelly-active` 控制图片，伪元素淡入切换状态；悬停放大 1.03、按下缩小 0.98，过渡为 `--jelly-duration: 280ms`。保留漂浮、日语提示、键盘焦点及减少动画适配。素材处理提示：保留原果冻外形、颜色与质感，去除文字及背景，输出透明素材。

600px 以下，以及 `max-width: 900px` 且 `min-height: 521px` 的区间，人像高度使用 `--portrait-mobile-height: 75svh`，约占屏幕高度的四分之三，居中贴底。宽度按素材比例计算并限制在首页宽度内；窄长屏保持现有 SVG cover 显示方式，可能裁掉两侧少量衣服。桌面尺寸和跟随参数不变。

左右排版时，标题区和上排导航的顶部共同使用 `--menu-top`，保持视觉水平对齐；导航按盒子上沿定位。手机仍保留标题在上、导航在下的布局。

首页上方的“个人经历、个人兴趣、工作项目”共用 `--menu-top`，水平对齐；最窄手机使用等分三列和紧凑图标，避免重叠。其余两个入口位置不变。

在 `max-width: 900px` 且 `min-height: 521px` 时，`.home` 使用 `--menu-top: 47%`，百分比相对于导航容器高度。

旧毛绒按钮素材保留在 `public/images/menu-buttons/` 以便回退，当前导航使用独立果冻图片，文字由 HTML 渲染。

首页采用海报式不对称布局：桌面左侧 40% 为两行粗体标题和简介，彩色人像在 71% 的横向位置贴底，导航分布在右侧区域。`--home-copy-width`、`--home-title-size`、`--home-portrait-x` 集中控制构图。900px 以下改为上方标题、下方人像与导航；窄而矮的窗口使用独立紧凑布局，通过容器单位限制人像尺寸，保留文字可读性。菜单弹出、人像跟随和场景切换逻辑不变。

人像只在鼠标进入 `.scene-menu` 区域时绑定移动监听，离开后移除监听并平滑回正；标题区和菜单区域外不会驱动跟随。跟随幅度、平滑参数和场景切换保持原有设置。

`.app__brand` 的右边线复用 Header 的线宽和颜色，`padding-right: var(--space-md)` 控制文字与边线的间距。

Header 的上下细边线位于 `global.css` 的 `.app__header`；`--header-border-width` 控制线宽，`--header-padding-block` 控制上下内边距，颜色复用 `--color-border`。矮屏会减小内边距。

首页当前采用关键帧人物头像与半透明树脂漂浮导航。菜单仍通过 `--menu-*` 管理尺寸和位置，浮动仅作用于图片视觉层，不改变点击范围。`UniverseBackdrop.astro` 保留为未使用的旧装饰组件。

菜单使用透明剪纸 PNG 图标，不依赖图标库。`global.css` 中 `--portrait-scale: 1.728` 控制人像放大比例。窄屏与矮屏使用独立基准尺寸，再应用同一个比例。人像跟随参数、校准和场景动画不受这些样式调整影响。

代码格式化使用 Prettier 和 Astro 插件。VS Code 中安装推荐扩展 `Prettier - Code formatter` 和 `Astro` 后，保存文件会自动格式化。

```sh
npm run format        # 格式化源码、配置和文档
npm run format:check  # 只检查格式
```

规则在 `.prettierrc.json`：2 空格缩进、JS/TS 单引号、保留分号、每行目标长度 100 字符。`.prettierignore` 排除构建产物、依赖和静态资源。请修改 `src/` 中的源码；`dist/` 是构建产物，重新构建会覆盖。

- `src/pages/index.astro`：首页结构、标题、组件组合。
- `src/components/Portrait.astro`：分层人像、鼠标跟随和开发时的母版对照开关。
- `src/components/SpritePortrait.astro`：当前首页的关键帧头像，使用 `public/images/portrait-frames/portrait-00.png` ～ `portrait-14.png`，固定正方形 img 贴底显示，保留旧人像组件以便回退。
- `src/scripts/spritePortrait.ts`：通过首页事件检查独立 `.home__tracking-area`，仅范围内处理跟随，按区域内相对位置切换头像；离开范围恢复正面；顶部 `tracking` 管理横纵区域、边界缓冲和正面帧。每帧最多更新一次，仅鼠标设备启用，离开窗口、失焦或离开首页时回正；触屏及减少动画模式固定正面。

当前头像源图 `public/images/portrait-sprite_2.png` 仅用于离线处理（旧版 `portrait-sprite.png` 保留），不在首页加载。`scripts/prepare-portrait-frames.mjs` 检测 15 个人物的透明轮廓，按头部轮廓和颈部/胸口中心重新对齐，统一肩宽及底边，输出 324 × 324 透明 PNG。`scripts/portrait-frame-calibration.json` 记录实际边界、锚点、缩放和放置位置；运行 `node scripts/prepare-portrait-frames.mjs` 可重新生成。保留抬头/低头造成的自然眼睛高度变化，不拉伸面部。前端预加载并解码所有帧后才启用跟随，以 `row * 5 + column` 切换 `src`，正面为第 07 帧。

- `src/components/SceneMenu.astro`：五个菜单入口，`entries` 管理名称和场景标识。
- `src/components/UniverseBackdrop.astro`：旧版装饰，当前首页未引用。
- `src/components/ProjectsScene.astro`：工作项目示例内容和返回按钮。
- `src/scripts/scenes.ts`：进入、返回动画及焦点管理，防止连续点击导致状态错乱。
- `src/scripts/homeEntrance.ts`：首次打开首页时标题逐字向上弹出，再让其他元素从左右进入；顶部 `entrance` 集中管理时长、错开时间与距离。返回首页不重播，减少动画模式直接显示，点击或键盘聚焦会立即结束入场。
- `src/styles/global.css`：全局主题、全屏布局和响应式 CSS 变量。
- `astro.config.mjs` / `tsconfig.json`：Astro 默认配置 / 严格 TypeScript 配置。
- `package.json` / `package-lock.json`：命令、依赖及锁定版本。
- `AGENTS.md`：开发约定；`TODO.md`：后续待办。

`.app` 用 `100svh` 和三行 Grid 划分页眉、场景、页脚；中间行 `minmax(0, 1fr)` 避免撑高页面。`.home__stage` 是定位容器，人像使用 `50%` + `translate` 居中，菜单通过百分比位置分布在左、上、右。调颜色看 `--color-*`；调人像看 `--portrait-*`；调入口大小、间距和位置看 `--menu-*`、`--icon-size`。媒体查询覆盖变量以适配手机与矮屏。

场景位于 `.scenes` 的同一 Grid 单元，通过原生 Web Animations API 淡入淡出并横向移动。`--scene-duration`、`--scene-distance`、`--scene-easing` 控制时长、距离和节奏。切换结束后隐藏旧场景；`inert` 防止隐藏或切换中的内容获取焦点，进入后焦点移到标题，返回后恢复到工作项目按钮。系统开启“减少动态效果”时直接切换。小屏项目内容可在场景内滚动，不通过滚轮切换场景。

项目采用 [Astro 官方手动初始化方式](https://docs.astro.build/en/install-and-setup/)。无 UI 框架、后端或部署配置。

人像参数集中在 `Portrait.astro` 顶部：`alignment` 控制素材对齐，`tracking` 控制头部偏移、倾斜、瞳孔移动和平滑。坐标统一为 1086 × 1448 素材像素。`headX/headY/headTilt` 的安全上限为 4/2/0.45，保留头颈覆盖；`pupilX/pupilY` 默认 9/6，眼白裁切防止瞳孔越界；`smoothMs` 越大跟随越慢。只有鼠标设备启用跟随，触屏和减少动画模式保持默认姿态。离开窗口或首页会回正，母版对照时暂停跟随。

首页人像居中贴视窗底边，场景区域延伸至底部；页脚叠放且保留可读底色，工作项目内容仍避开页脚。窄屏和矮屏沿用各自的尺寸基准；开发用母版对照开关移至人像内部底边。

头像监听范围由 `.home__stage` 上的 `--tracking-left`、`--tracking-top`、`--tracking-width`、`--tracking-height` 控制，桌面和手机分别设置，不影响菜单布局。监听区域是无点击拦截的透明参考框，仅在区域内更新方向；越界取消待更新帧并回正。

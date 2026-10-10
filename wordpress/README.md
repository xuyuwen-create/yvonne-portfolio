# WordPress / ACF 本地练习

此目录仅保存 ACF 配置，不包含 WordPress 本体或数据库。

1. 使用 Local 创建本地 WordPress 网站，打开管理后台。记下站点地址（不要填 `/wp-admin`）。
2. 在插件中安装并启用 **Advanced Custom Fields**（免费版即可）。
3. 在文章 → 分类目录创建「好きなこと」，slug 必须为 `interests`。
4. 在 ACF → 工具 → 导入，选择本目录 `acf-interests.json`。检查位置规则为该分类，设置中的 **Show in REST API** 已开启。
5. 新建文章，填写标题，选择「好きなこと」分类，填 ACF 的「ひとこと」「場所」。图片使用文章的特色图片，并在媒体库填写有意义的替代文本。当前练习页展示标题、特色图片和两个 ACF 字段，不展示编辑器正文。
6. 发布文章。浏览器打开 `站点地址/wp-json/wp/v2/posts?_embed`，检查 `acf` 中出现两个字段。
7. 将根目录 `.env.example` 复制为 `.env`，填写 `WP_SITE_URL`，启动 Local 站点并重启 Astro 开发服务。通过首页 Blog 入口查看。
8. 更新文章后刷新开发页面；正式构建使用已导出的静态数据，步骤见下方。

只读取已发布且属于 interests 分类的文章，无需后台账号或密码。草稿不会展示。内容以纯文本渲染，不执行 WordPress 返回的 HTML。

## 发布到 GitHub Pages：静态导出

本地 `npm run dev` 继续从 `.env` 中的 `WP_SITE_URL` 实时读取 WordPress；`npm run build` 只读取 `src/data/interests.json`，不依赖 Local 是否运行。

1. 在本地 WordPress 发布文章，确认属于 interests 分类。
2. 在编辑文章的网址 `post=13` 中查看 ID。
3. 执行 `npm run blog:export -- 13`，仅导出明确选择的文章。导出会替换整份快照；需要保留多篇时一次列出全部 ID，例如 `npm run blog:export -- 13 20`。
4. 审阅 `src/data/interests.json`，确认全部可公开，测试文章不选。
5. 运行 `npm run build`、`npm run preview` 检查正式版本，再提交静态数据并推送 main 触发 Pages。

此次只导出 ID 13 的 GitHub Pages 正式文章，没有测试文章。快照会随仓库公开；`.env`、账号密码与完整 API 响应不会提交。当前导出器只支持无特色图片的文章；有图时会报错，需另行准备媒体导出，避免发布无法访问的本地图片。

未配置本地 WordPress 时，开发页也读取快照。开发模式配置了地址但连接失败时会打印提示并回退到已发布快照，不阻断其他场景；正式构建不访问 WordPress。内容按纯文本展示，记录中的网址暂时不自动转换为链接。

参考：[ACF REST API](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)、[WordPress Embedding](https://developer.wordpress.org/rest-api/using-the-rest-api/linking-and-embedding/)。

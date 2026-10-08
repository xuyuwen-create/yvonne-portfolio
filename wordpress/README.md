# WordPress / ACF 本地练习

此目录仅保存 ACF 配置，不包含 WordPress 本体或数据库。

1. 使用 Local 创建本地 WordPress 网站，打开管理后台。记下站点地址（不要填 `/wp-admin`）。
2. 在插件中安装并启用 **Advanced Custom Fields**（免费版即可）。
3. 在文章 → 分类目录创建「好きなこと」，slug 必须为 `interests`。
4. 在 ACF → 工具 → 导入，选择本目录 `acf-interests.json`。检查位置规则为该分类，设置中的 **Show in REST API** 已开启。
5. 新建文章，填写标题，选择「好きなこと」分类，填 ACF 的「ひとこと」「場所」。图片使用文章的特色图片，并在媒体库填写有意义的替代文本。当前练习页展示标题、特色图片和两个 ACF 字段，不展示编辑器正文。
6. 发布文章。浏览器打开 `站点地址/wp-json/wp/v2/posts?_embed`，检查 `acf` 中出现两个字段。
7. 将根目录 `.env.example` 复制为 `.env`，填写 `WP_SITE_URL`，启动 Local 站点并重启 Astro 开发服务。通过首页 Blog 入口查看。
8. 更新文章后刷新开发页面；静态预览需重新运行 `npm run build` 和 `npm run preview`。

只读取已发布且属于 interests 分类的文章，无需后台账号或密码。草稿不会展示。内容以纯文本渲染，不执行 WordPress 返回的 HTML。

GitHub Pages 仍是静态站点。Local 地址无法从 GitHub Actions 访问，暂不把它配置到线上。今后使用公开可访问的 WordPress 后台后，在 Actions 环境变量中设置 `WP_SITE_URL` 并重新构建。图片目前引用 WordPress 原地址，后台和媒体需保持可访问；本地图片不会自动上传到 Pages。

未配置地址时保持空状态；已配置但接口失败时构建报错，避免把获取失败误发布为空列表。本练习不安装新前端依赖、不改变人像和场景动画。

参考：[ACF REST API](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)、[WordPress Embedding](https://developer.wordpress.org/rest-api/using-the-rest-api/linking-and-embedding/)。

import { writeFile } from 'node:fs/promises';
import { fetchInterestPosts } from '../src/utils/wordpress.ts';

const ids = process.argv.slice(2).map(Number);
if (!ids.length || ids.some((id) => !Number.isInteger(id) || id <= 0)) {
  throw new Error('Specify confirmed public post IDs: npm run blog:export -- 13');
}
if (!process.env.WP_SITE_URL) throw new Error('Set WP_SITE_URL in .env first.');
const posts = await fetchInterestPosts(process.env.WP_SITE_URL);
const selected = posts.filter((post) => ids.includes(post.id));
if (new Set(selected.map((post) => post.id)).size !== new Set(ids).size) {
  throw new Error(
    'Some requested posts are not published in the interests category. Snapshot unchanged.',
  );
}
if (selected.some((post) => post.image)) {
  throw new Error(
    'Featured images need a separate asset export before publishing. Snapshot unchanged.',
  );
}
// 只导出明确选择的文章及展示字段，不保存完整 WordPress API 响应。
await writeFile(
  new URL('../src/data/interests.json', import.meta.url),
  `${JSON.stringify(selected, null, 2)}\n`,
);
console.log('Exported:', selected.map((post) => `${post.id}: ${post.title}`).join('\n'));

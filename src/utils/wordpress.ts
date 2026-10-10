import publishedPosts from '../data/interests.json' with { type: 'json' };
type WordPressPost = {
  id: number;
  title: { rendered: string };
  acf?: { interest_note?: string; interest_place?: string };
  _embedded?: {
    'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[];
  };
};

export type InterestPost = {
  id: number;
  title: string;
  note: string;
  place: string;
  image?: string;
  alt: string;
};

function plainText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(
      /&(?:amp|lt|gt|quot|apos|nbsp);/g,
      (entity) =>
        ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' })[
          entity
        ] ?? entity,
    )
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (entity, code: string) => {
      const number = code.toLowerCase().startsWith('x')
        ? parseInt(code.slice(1), 16)
        : Number(code);
      return number <= 0x10ffff ? String.fromCodePoint(number) : entity;
    });
}

export async function getInterestPosts(): Promise<InterestPost[]> {
  const site = import.meta.env.WP_SITE_URL?.trim();
  // 本地实时练习；正式构建只使用已确认公开的静态快照。
  if (!import.meta.env.DEV || !site) return publishedPosts;
  try {
    return await fetchInterestPosts(site);
  } catch (error) {
    console.warn(
      '[Blog] 本地 WordPress 暂不可用，改用已发布的静态数据。需要实时预览时请启动 Local。',
      error instanceof Error ? error.message : error,
    );
    return publishedPosts;
  }
}

export async function fetchInterestPosts(site: string): Promise<InterestPost[]> {
  const base = new URL(`${site.replace(/\/$/, '')}/`);
  if (!['http:', 'https:'].includes(base.protocol))
    throw new Error('WP_SITE_URL must use HTTP(S).');
  // 专用分类防止把 WordPress 的其他文章一起展示。
  async function read(path: string) {
    const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`WordPress API: HTTP ${response.status}`);
    return response.json();
  }
  const categories = await read('wp-json/wp/v2/categories?slug=interests');
  if (!Array.isArray(categories) || !categories.length) return [];
  const posts: InterestPost[] = [];
  // 每页读取 100 篇，继续分页直至读完；不静默截断内容。
  for (let page = 1; ; page++) {
    const response = await fetch(
      new URL(
        `wp-json/wp/v2/posts?categories=${Number(categories[0].id)}&status=publish&per_page=100&page=${page}&_embed=wp:featuredmedia`,
        base,
      ),
      { signal: AbortSignal.timeout(10000) },
    );
    if (!response.ok) throw new Error(`WordPress posts: HTTP ${response.status}`);
    const data: WordPressPost[] = await response.json();
    if (!Array.isArray(data)) throw new Error('Unexpected WordPress posts response.');
    for (const post of data) {
      const media = post._embedded?.['wp:featuredmedia']?.[0];
      const image = media?.source_url;
      posts.push({
        id: post.id,
        title: plainText(post.title?.rendered),
        note: plainText(post.acf?.interest_note),
        place: plainText(post.acf?.interest_place),
        image: typeof image === 'string' && /^https?:\/\//i.test(image) ? image : undefined,
        alt: plainText(media?.alt_text),
      });
    }
    const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? 1);
    if (page >= totalPages || !data.length) break;
  }
  return posts;
}

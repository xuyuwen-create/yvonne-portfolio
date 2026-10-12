# Yvonne Portfolio

制作実績、これまでの歩み、スキル、日々の記録を紹介する個人ポートフォリオです。

[公開サイト](https://xuyuwen-create.github.io/yvonne-portfolio/)

## 構成

Astro・TypeScript・HTML・CSSによる静的サイトです。クリックで画面を切り替え、マウスやタッチ操作に応じて人物の向きが変わります。レスポンシブ表示と「動きを減らす」設定に対応しています。

ブログはWordPress・ACFで管理し、公開する記事を静的データとして書き出して掲載しています。

## ローカル開発

```sh
npm ci
npm run dev
```

アクセス先はターミナルに表示されます。通常は `http://localhost:4321/yvonne-portfolio/` です。

```sh
npm run build
npm run preview
npm run format:check
```

## 主なファイル

- `src/pages/index.astro`：ページ全体の構成
- `src/components/`：各画面と共通の表示要素
- `src/scripts/`：画面切り替え・人物のインタラクション
- `src/styles/global.css`：テーマ・レイアウト・レスポンシブ設定
- `src/data/interests.json`：公開するブログ記事のデータ
- `public/images/`：画像素材

## 公開

`main` へのpushをきっかけに、GitHub Actionsでビルドし、GitHub Pagesへデプロイします。サイトのURLとベースパスは `astro.config.mjs` で設定しています。

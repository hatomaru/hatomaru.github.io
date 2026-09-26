# One Team. / portfolio SEO maintenance

対象は `OneTeam_dot/` と `portfolio/` 配下のHTMLです。Google所有権確認ファイルは変更・検証対象から除外します。公開URLは既存設定と同じ `https://hatomaru.github.io/` を使用します。

## ページを追加・更新するとき

1. 本文と一致する固有のtitle・descriptionを記載します。実績、価格、評価などを推測で追加しません。
2. canonicalは絶対URLで、`index.html` はディレクトリURLへ正規化します。OGP・Twitterのtitle・description・URLも揃えます。
3. OGP画像は存在する公開画像の絶対URLを使用します。画像には内容に沿ったaltと、可能な場合は実寸のwidth・heightを記載します。ファーストビューの主要画像は遅延読み込みしません。
4. JSON-LDは本文に沿って更新します。作品ページにはWebPage / CreativeWorkと、表示するパンくずに一致するBreadcrumbListを記載しています。構造化データはリッチリザルトの表示保証ではありません。
5. 翻訳版は自己参照・相互参照のhreflangを揃えます。法域ごとに適用内容が異なるアプリのプライバシー通知は翻訳版とみなしていません。
6. 作品を追加したら `portfolio/works-noscript.html` も更新します。この一覧はJavaScriptに依存せず、全作品へリンクします。トップの作品一覧への常設リンクと、OneTeam_dotの静的初期表示も維持します。

```powershell
python scripts/generate_sitemap.py
python scripts/check_seo.py --links --sitemaps
python -m unittest discover -s scripts -p "test_*.py"
python scripts/generate_sitemap.py --check
node --check portfolio/works-renderer.js
```

検証は標準Pythonライブラリのみを使用し、GitHub Actionsでも実行します。生成コマンドは実行ディレクトリに依存しません。サイトマップは自己canonicalかつindex可能なページのみを含みます。旧Labポリシー2ページは従来のサイトマップ除外に合わせてnoindexを明示しました。BlockWorld Aiの作品固有ガイドラインは他のガイドラインと別内容のため、自己canonicalとして掲載します。

lastmodは省略しています。ファイルのmtimeはチェックアウトやコピーで変わるため、ページ更新日として送信しません。実際の内容更新履歴を管理できる場合のみ導入してください。robots.txtはドメイン直下のものが有効です。既存の直下robots.txtはクロールを許可し、統合サイトマップを参照しています。

## 公開後の確認

- Search Consoleで `https://hatomaru.github.io/sitemap.xml` を送信し、代表URLのURL検査を行います。
- Googleが選択したcanonical、インデックス登録状況、検索クエリとクリック率を確認します。
- Rich Results Testで対応する構造化データを確認します。
- PageSpeed InsightsでモバイルのLCP・INP・CLSを測定します。ローカルの表示確認だけでは実測値を保証できません。

この変更自体はpush・デプロイ・Search Console操作を行いません。

参照: [Google canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[サイトマップ](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)、[JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)。

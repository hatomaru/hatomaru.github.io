const currentYear = document.getElementById('current-year');
const titleEl = document.getElementById('report-title');
const metaEl = document.getElementById('report-meta');
const tagsEl = document.getElementById('report-tags');
const summaryMediaEl = document.getElementById('summary-media');
const summaryDescriptionEl = document.getElementById('summary-description');
const kaizenListEl = document.getElementById('kaizen-list');
const thanksMessageEl = document.getElementById('thanks-message');

const tagPalette = [
  '#FF9AA2',
  '#FFDAC1',
  '#E2F0CB',
  '#B5EAD7',
  '#C7CEEA',
  '#F9F1A5',
  '#A7E0F2'
];

const params = new URLSearchParams(window.location.search);
let slug = params.get('id');

// フォールバック: クエリパラメータがない場合はハッシュ部 (#slug) も受け付ける
if (!slug) {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) slug = hash;
}

const setYear = () => {
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
};

// ページ上部（report-hero）の下に目立つエラーバナーを出す
const showBanner = (message) => {
  try {
    const hero = document.getElementById('report-hero');
    if (!hero) return;
    // 既にバナーがあれば更新
    let banner = hero.querySelector('.report-error');
    if (!banner) {
      banner = document.createElement('p');
      banner.className = 'report-error card';
      banner.setAttribute('role', 'alert');
      hero.insertBefore(banner, hero.firstChild);
    }
    banner.textContent = message;
  } catch (e) {
    // バナー表示に失敗しても処理を続ける
    // console は開発者が見れば十分
    console.warn('showBanner failed', e);
  }
};

const init = async () => {
  if (!slug) {
    renderNotFound('レポートIDが指定されていません。');
    return;
  }

  try {
    const response = await fetch('data/reports.json');
    if (!response.ok) {
      throw new Error('レポートデータの取得に失敗しました');
    }

    const data = await response.json();
    const reports = Array.isArray(data.reports) ? data.reports : [];
    const report = reports.find((item) => item.slug === slug);

    if (!report) {
      renderNotFound('該当するレポートが見つかりませんでした。');
      return;
    }

    renderReport(report);

    // セクションのフロートイン用オブザーバを初期化
    initSectionObserver();
  } catch (error) {
    console.error(error);
    renderNotFound('レポートの表示に失敗しました。時間をおいて再度アクセスしてください。');
  }
};

// IntersectionObserver を使い、各セクションをスクロールで順にフロートインさせる
const initSectionObserver = () => {
  const main = document.querySelector('.site-main');
  if (main) main.classList.add('js-enabled');

  if (!('IntersectionObserver' in window)) {
    // 古いブラウザは即時表示
    document.querySelectorAll('.site-main section').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const sections = Array.from(document.querySelectorAll('.site-main section'));
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // ステージング用の遅延を設定（インデックスに基づく）
        const index = sections.indexOf(el);
        const delayMs = index * 150; // 各セクションを150msずつずらす
        el.style.setProperty('--delay', `${delayMs}ms`);
        el.classList.add('is-visible');
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  sections.forEach((s) => observer.observe(s));
};

const renderReport = (report) => {
  const { productName, testTitle, testDate, tags = [], summaries = null, summaryDescription, summaryMedia = [], kaizen = [], thanksMessage } = report;

  titleEl.textContent = `${productName}｜${testTitle}`;
  metaEl.textContent = formatDate(testDate);
  tagsEl.innerHTML = tags
    .map((tag) => `<span class="tag-pill" style="background-color: ${getTagColor(tag)}">${tag}</span>`)
    .join('');

  // summaries 配列があれば複数ブロックを表示、なければ従来の summaryMedia/summaryDescription を使う
  renderSummaries(summaries, summaryMedia, summaryDescription);
  renderKaizen(kaizen);
  renderThanks(thanksMessage);
};

const renderSummaries = (summaries, mediaItems, description) => {
  // 1) summaries 配列が提供されている場合はそれを優先して表示
  summaryMediaEl.innerHTML = '';
  summaryDescriptionEl.innerHTML = '';

  if (Array.isArray(summaries) && summaries.length) {
    summaries.forEach((s) => {
      const media = s.media || [];
      if (media.length) {
        const gallery = document.createElement('div');
        gallery.className = 'media-gallery';
        gallery.innerHTML = media.map(createMediaElement).join('');
        summaryMediaEl.appendChild(gallery);
      }

      if (s.title) {
        const h3 = document.createElement('h3');
        h3.className = 'section-subtitle';
        h3.textContent = s.title;
        summaryDescriptionEl.appendChild(h3);
      }

      if (s.description) {
        const p = document.createElement('p');
        // allow minimal inline HTML (e.g. <b>, <strong>) from JSON while stripping unsafe tags/attributes
        p.innerHTML = sanitizeAllowTags(s.description, ['b', 'strong', 'em', 'i', 'br', 'p']);
        summaryDescriptionEl.appendChild(p);
      }
    });
    return;
  }

  // 2) 従来フォーマット（summaryMedia, summaryDescription）との互換処理
  if (!mediaItems.length) {
    summaryMediaEl.innerHTML = '<p class="card">アンケート画像は現在準備中です。</p>';
  } else {
    summaryMediaEl.innerHTML = mediaItems.map(createMediaElement).join('');
  }
  // allow minimal inline HTML in legacy summaryDescription as well
  summaryDescriptionEl.innerHTML = description ? sanitizeAllowTags(description, ['b', 'strong', 'em', 'i', 'br', 'p']) : '';
};

// Simple sanitizer: allow only a small whitelist of inline tags and strip attributes.
// This reduces XSS surface while permitting <b>/<strong> for emphasis in JSON fields.
const sanitizeAllowTags = (input = '', allowed = ['b', 'strong']) => {
  if (!input) return '';
  const template = document.createElement('template');
  template.innerHTML = String(input);

  const walk = (node) => {
    const NODE_ELEMENT = 1;
    if (node.nodeType === NODE_ELEMENT) {
      const tag = node.tagName.toLowerCase();
      if (!allowed.includes(tag)) {
        // replace the node with its text content to avoid keeping unwanted markup
        const textNode = document.createTextNode(node.textContent);
        node.parentNode.replaceChild(textNode, node);
        return; // node replaced, skip walking its former children
      }

      // strip all attributes from allowed tags for safety
      [...node.attributes].forEach((attr) => node.removeAttribute(attr.name));
    }

    // walk children (careful when nodes get replaced)
    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      walk(child);
      child = next;
    }
  };

  walk(template.content);
  return template.innerHTML;
};

const createMediaElement = (media) => {
  if (media.type === 'video') {
    return `<video src="${media.src}" controls preload="metadata" playsinline></video>`;
  }
  return `<img src="${media.src}" alt="${media.alt || 'summary image'}" />`;
};

const renderKaizen = (kaizenItems) => {
  if (!kaizenItems.length) {
    kaizenListEl.innerHTML = '<p class="card">改善項目は現在整理中です。</p>';
    return;
  }

  kaizenListEl.innerHTML = kaizenItems
    .map((item, index) => createKaizenItem(item, index === 0))
    .join('');

  const toggles = kaizenListEl.querySelectorAll('.kaizen-item__header');
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => toggleKaizen(toggle));
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleKaizen(toggle);
      }
    });
  });
};

const createKaizenItem = (item, expanded = false) => {
  const { title, description, media = [] } = item;
  const gallery = media.map(createMediaElement).join('');
  return `
    <article class="kaizen-item ${expanded ? 'is-open' : ''}">
      <header class="kaizen-item__header" role="button" tabindex="0" aria-expanded="${expanded}">
        <h3 class="kaizen-item__title">${title}</h3>
        <span class="kaizen-item__toggle">▶</span>
      </header>
      <div class="kaizen-item__body">
        <p class="kaizen-item__description">${description}</p>
        ${gallery ? `<div class="media-gallery">${gallery}</div>` : ''}
      </div>
    </article>
  `;
};

const toggleKaizen = (headerEl) => {
  const parent = headerEl.closest('.kaizen-item');
  const isOpen = parent.classList.toggle('is-open');
  headerEl.setAttribute('aria-expanded', String(isOpen));
};

const renderThanks = (message) => {
  if (!message) {
    thanksMessageEl.innerHTML = '<p>メッセージは後日公開予定です。</p>';
    return;
  }
  thanksMessageEl.innerHTML = marked.parse(message);
};

const renderNotFound = (message) => {
  titleEl.textContent = 'レポートが見つかりません';
  metaEl.textContent = '';
  tagsEl.innerHTML = '';
  summaryMediaEl.innerHTML = '';
  summaryDescriptionEl.textContent = '';
  kaizenListEl.innerHTML = `<p class="card">${message}</p>`;
  thanksMessageEl.innerHTML = '';
  // 画面上部にも分かりやすくメッセージを表示
  showBanner(message);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' }).format(date);
  } catch (error) {
    return dateString;
  }
};

const getTagColor = (tag) => {
  const index = Math.abs(hashCode(tag)) % tagPalette.length;
  return tagPalette[index];
};

const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

setYear();
init();

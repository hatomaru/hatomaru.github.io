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
const slug = params.get('id');

const setYear = () => {
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
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
  } catch (error) {
    console.error(error);
    renderNotFound('レポートの表示に失敗しました。時間をおいて再度アクセスしてください。');
  }
};

const renderReport = (report) => {
  const { productName, testTitle, testDate, tags = [], summaryDescription, summaryMedia = [], kaizen = [], thanksMessage } = report;

  titleEl.textContent = `${productName}｜${testTitle}`;
  metaEl.textContent = formatDate(testDate);
  tagsEl.innerHTML = tags
    .map((tag) => `<span class="tag-pill" style="background-color: ${getTagColor(tag)}">${tag}</span>`)
    .join('');

  renderSummary(summaryMedia, summaryDescription);
  renderKaizen(kaizen);
  renderThanks(thanksMessage);
};

const renderSummary = (mediaItems, description) => {
  if (!mediaItems.length) {
    summaryMediaEl.innerHTML = '<p class="card">アンケート画像は現在準備中です。</p>';
  } else {
    summaryMediaEl.innerHTML = mediaItems.map(createMediaElement).join('');
  }

  summaryDescriptionEl.textContent = description || '';
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

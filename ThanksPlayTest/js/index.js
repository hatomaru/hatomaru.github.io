const REPORTS_PER_PAGE = 9;
const reportsContainer = document.getElementById('reports-container');
const tagContainer = document.getElementById('tag-container');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageStatus = document.getElementById('page-status');
const currentYear = document.getElementById('current-year');

const tagPalette = [
  '#FF9AA2',
  '#FFDAC1',
  '#E2F0CB',
  '#B5EAD7',
  '#C7CEEA',
  '#F9F1A5',
  '#A7E0F2'
];

let reports = [];
let activeTag = null;
let currentPage = 1;

const setYear = () => {
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
};

const fetchReports = async () => {
  try {
    const response = await fetch('data/reports.json');
    if (!response.ok) {
      throw new Error('レポートデータの取得に失敗しました');
    }
    const data = await response.json();
    const rawReports = Array.isArray(data.reports) ? data.reports : [];
    reports = rawReports.slice().sort((a, b) => {
      const dateA = new Date(a.testDate);
      const dateB = new Date(b.testDate);
      if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) {
        return 0;
      }
      return dateB - dateA;
    });
    renderTags();
    renderReports();
  } catch (error) {
    reportsContainer.innerHTML = `<p class="card">読み込みに失敗しました。リロードして再度お試しください。</p>`;
    console.error(error);
  }
};

const getFilteredReports = () => {
  if (!activeTag) {
    return reports;
  }
  return reports.filter((report) => report.tags?.includes(activeTag));
};

const paginateReports = (items) => {
  const totalPages = Math.max(1, Math.ceil(items.length / REPORTS_PER_PAGE));
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  const start = (currentPage - 1) * REPORTS_PER_PAGE;
  return {
    totalPages,
    items: items.slice(start, start + REPORTS_PER_PAGE)
  };
};

const renderReports = () => {
  const filtered = getFilteredReports();
  const { items, totalPages } = paginateReports(filtered);

  if (!items.length) {
    reportsContainer.innerHTML = '<p class="card">該当するレポートはまだありません。</p>';
  } else {
    reportsContainer.innerHTML = items
      .map((report) => createReportCard(report))
      .join('');
  }

  pageStatus.textContent = `${currentPage} / ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
};

const createReportCard = (report) => {
  const { slug, productName, testTitle, testDate, summary, tags = [] } = report;
  const tagPills = tags
    .map((tag) => `<span class="tag-pill" style="background-color: ${getTagColor(tag)}">${tag}</span>`)
    .join('');

  return `
    <article class="card report-card" aria-label="${productName} ${testTitle}">
      <h3 class="report-card__title">${testTitle}</h3>
      <p class="report-card__product">${productName}</p>
      <p class="report-card__meta">${formatDate(testDate)}</p>
      ${summary ? `<p class="report-card__summary">${summary}</p>` : ''}
      <div class="report-card__tags">${tagPills}</div>
      <a class="button button--primary report-card__link" href="report.html?id=${encodeURIComponent(slug)}">レポートを見る</a>
    </article>
  `;
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

const renderTags = () => {
  const uniqueTags = Array.from(new Set(reports.flatMap((report) => report.tags || [])));
  if (!uniqueTags.length) {
    tagContainer.innerHTML = '<p class="card">タグ情報は現在準備中です。</p>';
    return;
  }

  const allButton = document.createElement('button');
  allButton.textContent = 'すべて';
  allButton.className = 'tag-button';
  allButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  allButton.addEventListener('click', () => {
    activeTag = null;
    currentPage = 1;
    highlightActiveTag(allButton);
    renderReports();
  });

  tagContainer.innerHTML = '';
  tagContainer.appendChild(allButton);

  uniqueTags.forEach((tag) => {
    const button = document.createElement('button');
    button.textContent = tag;
    button.className = 'tag-button';
    button.style.backgroundColor = getTagColor(tag);
    button.addEventListener('click', () => {
      activeTag = activeTag === tag ? null : tag;
      currentPage = 1;
      highlightActiveTag(button, tag);
      renderReports();
    });
    tagContainer.appendChild(button);
  });

  highlightActiveTag(allButton);
};

const highlightActiveTag = (activeButton, tagLabel = null) => {
  const buttons = Array.from(tagContainer.querySelectorAll('.tag-button'));
  buttons.forEach((btn) => btn.classList.remove('is-active'));

  if (!activeTag) {
    const defaultButton = buttons[0];
    if (defaultButton) {
      defaultButton.classList.add('is-active');
    }
    return;
  }

  if (tagLabel && activeTag === tagLabel) {
    activeButton.classList.add('is-active');
    return;
  }

  const fallback = buttons.find((btn) => btn.textContent === activeTag);
  if (fallback) {
    fallback.classList.add('is-active');
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

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
    renderReports();
  }
});

nextPageBtn.addEventListener('click', () => {
  const filtered = getFilteredReports();
  const totalPages = Math.max(1, Math.ceil(filtered.length / REPORTS_PER_PAGE));
  if (currentPage < totalPages) {
    currentPage += 1;
    renderReports();
  }
});

setYear();
fetchReports();

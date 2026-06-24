// works-renderer.js
let worksData = [];
const itemsPerPage = 6;
let currentPage = 1;

let presentationsData = [];
const presentationItemsPerPage = 3;
let currentPresentationPage = 1;

function renderFeature(featureData) {
    if (!featureData) return;
    const container = document.getElementById("feature-container");
    if (!container) return;
    
    // Featureを配列化（3つの表示に対応）
    const featuresList = Array.isArray(featureData) ? featureData : [featureData];
    
    let html = '<div class="feature-scroll-wrapper" id="feature-scroll-wrapper"><div class="feature-scroll-track" id="feature-scroll-track">';
    
    const renderCard = (feature) => `
    <a href="${feature.link}" class="feature-card ticket-layout">
        <div class="feature-image-container">
            <img src="${feature.image}" alt="Featured Project">
        </div>
        <div class="ticket-divider"></div>
        <div class="feature-info">
            <div class="feature-badge">${feature.badge}</div>
            <h3>${feature.title}</h3>
            <div class="feature-reason">
                <h4><span class="material-symbols-outlined">${feature.reasonIcon}</span> ${feature.reasonTitle}</h4>
                <p>${feature.reasonDesc}</p>
            </div>
        </div>
    </a>`;

    const cardsHtml = featuresList.map(renderCard).join('');
    
    // 無限ループのために3倍にする（前・中・後）
    html += cardsHtml + cardsHtml + cardsHtml; 
    
    html += '</div></div>';
    container.innerHTML = html;

    // ドラッグスクロールの初期化
    initFeatureScroller(featuresList.length);
}

function initFeatureScroller(originalCount) {
    const wrapper = document.getElementById("feature-scroll-wrapper");
    const track = document.getElementById("feature-scroll-track");
    if (!wrapper || !track) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let isMoving = false;

    // 初期位置を中央（2セット目の開始位置）に設定
    const cardWidth = track.scrollWidth / 3;
    wrapper.scrollLeft = cardWidth;

    const startAction = (e) => {
        isDown = true;
        isMoving = false;
        wrapper.classList.add('active');
        startX = (e.pageX || e.touches[0].pageX) - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
    };

    const stopAction = () => {
        isDown = false;
        wrapper.classList.remove('active');
        // ドラッグ移動した場合はリンク遷移を抑制するためにフラグを使用（任意）
    };

    const moveAction = (e) => {
        if (!isDown) return;
        e.preventDefault();
        isMoving = true;
        const x = (e.pageX || e.touches[0].pageX) - wrapper.offsetLeft;
        const walk = (x - startX) * 2; // スクロール速度の調整
        wrapper.scrollLeft = scrollLeft - walk;
        checkInfiniteScroll();
    };

    const checkInfiniteScroll = () => {
        // 左端のセットに到達したら中央セットへワープ
        if (wrapper.scrollLeft <= 0) {
            wrapper.scrollLeft = cardWidth;
        } 
        // 右端のセット（2セット目以降）に到達したら中央セットへワープ
        else if (wrapper.scrollLeft >= cardWidth * 2) {
            wrapper.scrollLeft = cardWidth;
        }
    };

    wrapper.addEventListener('mousedown', startAction);
    wrapper.addEventListener('touchstart', startAction, { passive: true });
    
    window.addEventListener('mouseleave', stopAction);
    window.addEventListener('mouseup', stopAction);
    window.addEventListener('touchend', stopAction);

    wrapper.addEventListener('mousemove', moveAction);
    wrapper.addEventListener('touchmove', moveAction);

    // スムーズなスクロールのためのイベント
    wrapper.addEventListener('scroll', checkInfiniteScroll);

    // カードクリック時のドラッグ判定
    wrapper.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (isMoving) e.preventDefault();
        });
    });
}

function renderWorks() {
    const container = document.getElementById("app-grid-container");
    if (!container) return;
    
    // pagination
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const itms = worksData.slice(startIdx, endIdx);
    
    // 作品データがない場合のデバッグまたはガード
    if (itms.length === 0 && worksData.length > 0) {
        currentPage = 1;
        renderWorks();
        return;
    }

    container.innerHTML = "";

    let html = "";
    itms.forEach(work => {
        let tagsHtml = "";
        if (work.tags) {
            work.tags.forEach(tag => {
                let styleStr = 'background-color:' + (tag.bg || 'transparent') + ';color:' + (tag.fg || 'white') + ';';
                if (tag.border) styleStr += `border:${tag.border};font-weight:bold;`;
                
                let iconHtml = tag.icon ? `<span class="material-symbols-outlined" style="padding-right: 5px">${tag.icon}</span>` : "";
                tagsHtml += `<li><span class="app-genre" style="${styleStr}">${iconHtml}${tag.text}</span></li>\n`;
            });
        }
        
        // Ensure some properties have fallbacks
        let position = work.imagePos ? work.imagePos : "50% 50%";
        let authorTypeStr = work.authorType ? `<div class="glass-icon"><span class="material-symbols-outlined">${work.authorIcon}</span>${work.authorType}</div>` : '';
        let appealStr = work.appeal ? `<div class="app-appeal">${work.appeal}</div>` : '';
        let yearStr = work.year ? `<p class="Year">${work.year}</p>` : '';
        
        let imageSrc = work.image || "src/default_thumbnail.svg";
        html += `
        <div class="app-card animate-on-scroll fade-in-up delay-1">
          <a href="${work.link}" style="color:black; text-decoration: none;">
            ${authorTypeStr}
            <div class="app-image-container">
              <img src="${imageSrc}" alt="作品のスクリーンショット" style="object-position: ${position};">
            </div>
            <div class="app-info">
              <h3>${work.title}</h3>
              ${appealStr}
              <ul>
                ${tagsHtml}
              </ul>
              <p>${work.desc}</p>
              ${yearStr}
            </div>
          </a>
        </div>`;
    });
    
    container.innerHTML = html;
    
    renderPagination();
    if(typeof window.initScrollAnimation === 'function') {
        window.initScrollAnimation();
    }
}

function renderPagination() {
    const c = document.getElementById("pagination-controls");
    if (!c) return;
    
    const totalPages = Math.ceil(worksData.length / itemsPerPage);
    if (totalPages <= 1) {
        c.innerHTML = "";
        return;
    }

    let buttonsHtml = "";
    
    const prevDisabled = currentPage === 1 ? "disabled" : "";
    buttonsHtml += `<button class="page-btn nav-btn ${prevDisabled}" onclick="changePage(${currentPage - 1})"><span class="material-symbols-outlined" style="font-size: 18px">chevron_left</span> Prev</button>`;
    
    for(let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? "active" : "";
        buttonsHtml += `<button class="page-btn ${active}" onclick="changePage(${i})">${i}</button>`;
    }
    
    const nextDisabled = currentPage === totalPages ? "disabled" : "";
    buttonsHtml += `<button class="page-btn nav-btn ${nextDisabled}" onclick="changePage(${currentPage + 1})">Next <span class="material-symbols-outlined" style="font-size: 18px">chevron_right</span></button>`;
    
    c.innerHTML = buttonsHtml;
}

window.changePage = function(page) {
    const totalPages = Math.ceil(worksData.length / itemsPerPage);
    if(page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderWorks();
    
    // Smooth scroll back to top of the Works section with offset
    const target = document.getElementById("app");
    if (target) {
        const offset = 140; // Offset enough to show the 'Works' title above it
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = target.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
             top: offsetPosition,
             behavior: "smooth"
        });
    }
}

function renderPresentations() {
    const container = document.getElementById("presentation-list-container");
    if (!container) return;
    
    const startIdx = (currentPresentationPage - 1) * presentationItemsPerPage;
    const endIdx = startIdx + presentationItemsPerPage;
    const items = presentationsData.slice(startIdx, endIdx);
    
    if (items.length === 0 && presentationsData.length > 0) {
        currentPresentationPage = 1;
        renderPresentations();
        return;
    }

    container.innerHTML = "";

    let html = "";
    items.forEach(pres => {
        const linkUrl = pres.youtubeUrl || pres.linkUrl || "#";
        const linkText = pres.linkText || (pres.youtubeUrl ? "YouTubeで見る" : "見る");
        const thumbnail = pres.thumbnail || "src/default_thumbnail.svg";
        const metaHtml = pres.meta ? `<span class="presentation-meta-text" style="font-size: 0.85rem; color: #6b7280; font-weight: 600; margin-left: 8px;">${pres.meta}</span>` : "";
        
        html += `
        <div class="presentation-item animate-on-scroll fade-in-up delay-1">
          <a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="presentation-video-link">
            <div class="presentation-thumbnail-wrapper">
              <img src="${thumbnail}" alt="Thumbnail" class="presentation-thumbnail" ${!pres.thumbnail ? 'style="object-fit: cover;"' : ''}>
            </div>
          </a>
          <div class="presentation-content">
            <div class="presentation-meta">
              <span class="presentation-date">${pres.date}</span>
              <span class="presentation-badge ${pres.badgeClass}">${pres.badgeText}</span>
              ${metaHtml}
            </div>
            <h3 class="presentation-title">${pres.title}</h3>
            <p class="presentation-desc">${pres.desc}</p>
            <a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="presentation-link-btn">${linkText}</a>
          </div>
        </div>`;
    });
    
    container.innerHTML = html;
    renderPresentationPagination();
    
    if(typeof window.initScrollAnimation === 'function') {
        window.initScrollAnimation();
    }
}

function renderPresentationPagination() {
    const c = document.getElementById("presentation-pagination-controls");
    if (!c) return;
    
    const totalPages = Math.ceil(presentationsData.length / presentationItemsPerPage);
    if (totalPages <= 1) {
        c.innerHTML = "";
        return;
    }

    let buttonsHtml = "";
    
    const prevDisabled = currentPresentationPage === 1 ? "disabled" : "";
    buttonsHtml += `<button class="page-btn nav-btn ${prevDisabled}" onclick="changePresentationPage(${currentPresentationPage - 1})"><span class="material-symbols-outlined" style="font-size: 18px">chevron_left</span> Prev</button>`;
    
    for(let i = 1; i <= totalPages; i++) {
        const active = i === currentPresentationPage ? "active" : "";
        buttonsHtml += `<button class="page-btn ${active}" onclick="changePresentationPage(${i})">${i}</button>`;
    }
    
    const nextDisabled = currentPresentationPage === totalPages ? "disabled" : "";
    buttonsHtml += `<button class="page-btn nav-btn ${nextDisabled}" onclick="changePresentationPage(${currentPresentationPage + 1})">Next <span class="material-symbols-outlined" style="font-size: 18px">chevron_right</span></button>`;
    
    c.innerHTML = buttonsHtml;
}

window.changePresentationPage = function(page) {
    const totalPages = Math.ceil(presentationsData.length / presentationItemsPerPage);
    if(page < 1 || page > totalPages) return;
    
    currentPresentationPage = page;
    renderPresentations();
    
    const target = document.getElementById("activity");
    if (target) {
        const offset = 140;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = target.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
             top: offsetPosition,
             behavior: "smooth"
        });
    }
}

// Fetch JSON on load
fetch('works.json')
  .then(res => res.json())
  .then(data => {
      renderFeature(data.feature);
      worksData = data.works;
      renderWorks();
      
      let combinedPresentations = [];
      if (data.presentations) {
          combinedPresentations = combinedPresentations.concat(data.presentations);
      }
      
      if (window.__MEDIA_DATA) {
          const mappedMedia = window.__MEDIA_DATA.map(m => {
              let dateStr = m.published || "";
              if (dateStr.includes('-')) {
                  const parts = dateStr.split('-');
                  dateStr = `${parts[0]}.${parts[1]}`;
              }
              return {
                  date: dateStr,
                  badgeClass: "media",
                  badgeText: "掲載",
                  meta: m.meta,
                  title: m.title,
                  desc: m.desc,
                  linkUrl: m.href,
                  thumbnail: m.image || "src/default_thumbnail.svg",
              };
          });
          combinedPresentations = combinedPresentations.concat(mappedMedia);
      }
      
      if (combinedPresentations.length > 0) {
          combinedPresentations.sort((a, b) => {
              let dateA = a.date;
              let dateB = b.date;
              if (dateA === "TGS2024") dateA = "2024.09";
              if (dateB === "TGS2024") dateB = "2024.09";
              return dateA < dateB ? 1 : (dateA > dateB ? -1 : 0);
          });
          presentationsData = combinedPresentations;
          renderPresentations();
      }
  })
  .catch(err => {
      console.error("Failed to load works.json", err);
  });

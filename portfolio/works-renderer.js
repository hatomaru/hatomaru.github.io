// works-renderer.js
let worksData = [];
const itemsPerPage = 6;
let currentPage = 1;

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
    container.innerHTML = "";
    
    // pagination
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const itms = worksData.slice(startIdx, endIdx);

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
        
        html += `
        <div class="app-card animate-on-scroll fade-in-up delay-1">
          <a href="${work.link}" style="color:black; text-decoration: none;">
            ${authorTypeStr}
            <div class="app-image-container">
              <img src="${work.image}" alt="作品のスクリーンショット" style="object-position: ${position};">
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

// Fetch JSON on load
fetch('works.json')
  .then(res => res.json())
  .then(data => {
      renderFeature(data.feature);
      worksData = data.works;
      renderWorks();
  })
  .catch(err => {
      console.error("Failed to load works.json", err);
  });

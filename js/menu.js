// JavaScript Document
// ハンバーガーメニューの初期化関数
function initHamburgerMenu() {
  console.log('initHamburgerMenu called'); // デバッグ用
  
  // ハンバーガーメニューとナビゲーションメニューの要素を取得
  var hamburger = document.querySelector('.hamburger-menu') || document.getElementById('hamburger-menu');
  var navbarMenu = document.querySelector('.navbar-menu');

  console.log('Hamburger element:', hamburger); // デバッグ用
  console.log('Navbar menu element:', navbarMenu); // デバッグ用

  if (hamburger && navbarMenu) {
    // 既存のイベントリスナーを削除（重複を防ぐため）
    hamburger.removeEventListener('click', toggleMenu);
    
    // ハンバーガーメニューがクリックされたときのイベントリスナー
    hamburger.addEventListener('click', toggleMenu);
    console.log('Event listeners attached successfully'); // デバッグ用

    // メニュー項目がクリックされたらメニューを閉じる
    var menuItems = navbarMenu.querySelectorAll('a');
    menuItems.forEach(function(item) {
      item.removeEventListener('click', closeMenu);
      item.addEventListener('click', closeMenu);
    });

    // 画面をクリックしたらメニューを閉じる（メニュー外をクリック）
    document.removeEventListener('click', handleOutsideClick);
    document.addEventListener('click', handleOutsideClick);

    // 画面サイズが変更されたときの処理
    window.removeEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
  } else {
    console.log('Hamburger menu elements not found'); // デバッグ用
    console.log('Retrying in 100ms...'); // デバッグ用
    // 要素がまだ見つからない場合は少し待ってから再試行
    setTimeout(initHamburgerMenu, 100);
  }
}

// メニューのトグル関数
function toggleMenu(event) {
  console.log('toggleMenu called'); // デバッグ用
  event.stopPropagation();
  var hamburger = document.querySelector('.hamburger-menu');
  var navbarMenu = document.querySelector('.navbar-menu');
  
  console.log('Toggle - Hamburger:', hamburger); // デバッグ用
  console.log('Toggle - NavbarMenu:', navbarMenu); // デバッグ用
  
  if (hamburger && navbarMenu) {
    navbarMenu.classList.toggle('is-active');
    hamburger.classList.toggle('is-active');
    console.log('Menu toggled - is-active classes added/removed'); // デバッグ用
  } else {
    console.log('Toggle failed - elements not found'); // デバッグ用
  }
}

// メニューを閉じる関数
function closeMenu() {
  var hamburger = document.querySelector('.hamburger-menu');
  var navbarMenu = document.querySelector('.navbar-menu');
  
  if (hamburger && navbarMenu) {
    navbarMenu.classList.remove('is-active');
    hamburger.classList.remove('is-active');
  }
}

// 外部クリック処理
function handleOutsideClick(event) {
  var hamburger = document.querySelector('.hamburger-menu');
  var navbarMenu = document.querySelector('.navbar-menu');
  
  if (hamburger && navbarMenu) {
    var isClickInsideNav = navbarMenu.contains(event.target);
    var isClickOnHamburger = hamburger.contains(event.target);
    
    if (!isClickInsideNav && !isClickOnHamburger && navbarMenu.classList.contains('is-active')) {
      closeMenu();
    }
  }
}

// リサイズ処理
function handleResize() {
  if (window.innerWidth > 768) {
    closeMenu();
  }
}

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
  initHamburgerMenu();
  
  // MutationObserverを使用して動的に追加される要素を監視
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        // 新しいノードが追加された場合、ハンバーガーメニューを再初期化
        var addedNodes = Array.from(mutation.addedNodes);
        var hasNavbar = addedNodes.some(function(node) {
          return node.nodeType === 1 && (
            node.classList && node.classList.contains('navbar') ||
            node.querySelector && node.querySelector('.navbar')
          );
        });
        
        if (hasNavbar) {
          // 少し遅延を入れて初期化（DOM構築完了を待つ）
          setTimeout(initHamburgerMenu, 100);
        }
      }
    });
  });
  
  // body要素の変更を監視
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

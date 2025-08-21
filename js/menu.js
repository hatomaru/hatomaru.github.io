// JavaScript Document
// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
  // ハンバーガーメニューとナビゲーションメニューの要素を取得
  var hamburger = document.querySelector('.hamburger-menu');
  var navbarMenu = document.querySelector('.navbar-menu');

  // ハンバーガーメニューがクリックされたときのイベントリスナー
  if (hamburger && navbarMenu) {
    hamburger.addEventListener('click', function () {
      // メニューの表示状態を切り替える
      navbarMenu.classList.toggle('is-active');
      hamburger.classList.toggle('is-active');
    });

    // メニュー項目がクリックされたらメニューを閉じる
    var menuItems = navbarMenu.querySelectorAll('a');
    menuItems.forEach(function(item) {
      item.addEventListener('click', function() {
        navbarMenu.classList.remove('is-active');
        hamburger.classList.remove('is-active');
      });
    });

    // 画面をクリックしたらメニューを閉じる（メニュー外をクリック）
    document.addEventListener('click', function(event) {
      var isClickInsideNav = navbarMenu.contains(event.target);
      var isClickOnHamburger = hamburger.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnHamburger && navbarMenu.classList.contains('is-active')) {
        navbarMenu.classList.remove('is-active');
        hamburger.classList.remove('is-active');
      }
    });

    // 画面サイズが変更されたときの処理
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        navbarMenu.classList.remove('is-active');
        hamburger.classList.remove('is-active');
      }
    });
  }
});

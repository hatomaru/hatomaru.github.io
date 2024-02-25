// JavaScript Document
// ハンバーガーメニューとナビゲーションメニューの要素を取得
var hamburger = document.querySelector('.hamburger-menu');
var navbarMenu = document.querySelector('.navbar-menu');

// ハンバーガーメニューがクリックされたときのイベントリスナー
hamburger.addEventListener('click', function () {
  // メニューの表示状態を切り替える
  navbarMenu.classList.toggle('is-active');
});

// JavaScriptを使用して、インタラクティブな要素や動的な機能を追加します。
// スライドショーの機能
var slideIndex = 1;
showSlides(slideIndex);

// 次の/前のコントロール
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// ドットナビゲーションのコントロール
function currentSlide(n) {
  showSlides(slideIndex = n);
}

// スライドの表示を管理する関数
function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}

// スライド画像の縦横を自動判定してクラスを付与
(function() {
  function setOrientationClass(img) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    var isPortrait = img.naturalHeight > img.naturalWidth;
    img.classList.remove('is-portrait', 'is-landscape');
    img.classList.add(isPortrait ? 'is-portrait' : 'is-landscape');
  }

  function applyToAll() {
    var imgs = document.querySelectorAll('.slideshow-container img');
    imgs.forEach(function(img){
      if (img.complete && img.naturalWidth > 0) {
        setOrientationClass(img);
      } else {
        img.addEventListener('load', function onLoad(){
          img.removeEventListener('load', onLoad);
          setOrientationClass(img);
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyToAll);
  } else {
    applyToAll();
  }
})();


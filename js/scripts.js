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


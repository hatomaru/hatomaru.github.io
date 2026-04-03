async function handleMessageSubmit(e) {
  e.preventDefault();
  
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('message-submit-btn');
  const status = document.getElementById('message-status');
  const rawMessage = document.getElementById('message-body').value;

  // Validation 1: 1文字以上のチェック (全角半角スペースのみはスキップ)
  const trimmedMessage = rawMessage.replace(/　/g, ' ').trim();
  if (trimmedMessage.length === 0) {
    status.innerText = "メッセージを1文字以上ご入力ください。";
    status.style.display = "block";
    status.style.color = "#ef4444";
    return;
  }

  // Validation 2: URLおよびHTMLタグ等の禁止文字チェック
  const urlRegex = /(https?:\/\/|www\.)|([a-zA-Z0-9-]+\.(com|net|jp|co\.jp|link|xyz|org|info|me|io)\/?)/i;
  const htmlRegex = /<[^>]+>/;
  
  if (urlRegex.test(rawMessage)) {
    status.innerText = "セキュリティの都合上、URLを含めることはできません。";
    status.style.display = "block";
    status.style.color = "#ef4444";
    return;
  }
  if (htmlRegex.test(rawMessage)) {
    status.innerText = "セキュリティの都合上、HTMLなどの特殊タグを含めることはできません。";
    status.style.display = "block";
    status.style.color = "#ef4444";
    return;
  }

  status.style.display = 'none';
  btn.disabled = true;

  // アニメーション用要素
  const overlay = document.getElementById('env-overlay');
  const letter = document.getElementById('env-letter');
  const flap = document.getElementById('env-flap');
  const wrapper = document.getElementById('env-wrapper');
  const successMsg = document.getElementById('env-success-msg');

  // アニメーション初期化
  overlay.style.display = 'flex';
  letter.style.transform = 'translateY(-70px)';
  flap.style.transform = 'rotateX(180deg)';
  wrapper.style.transition = 'none';
  wrapper.style.transform = 'translateY(0) scale(1)';
  wrapper.style.opacity = '1';
  successMsg.style.opacity = '0';

  // 手紙を封筒に入れる
  setTimeout(() => {
    letter.style.transform = 'translateY(0)';
  }, 50);

  // フラップを閉じる
  setTimeout(() => {
    flap.style.transform = 'rotateX(0deg)';
  }, 650);

  // APIリクエストとアニメーションの待機時間を並行処理
  const fetchPromise = fetch("https://formsubmit.co/ajax/oneteam.dot@gmail.com", {
    method: "POST",
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _subject: "One Team. へのメッセージ",
      メッセージ: rawMessage
    })
  });

  const minAnimWait = new Promise(resolve => setTimeout(resolve, 1400));

  try {
    const [response] = await Promise.all([fetchPromise, minAnimWait]);
    
    if (!response.ok) {
      throw new Error("送信エラー");
    }

    // 封筒が飛んでいくアニメーション
    wrapper.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
    wrapper.style.transform = 'translateY(-40px) scale(0.8)';
    wrapper.style.opacity = '0';
    
    // 完了メッセージの表示
    setTimeout(() => {
      successMsg.style.opacity = '1';
    }, 400);

    // フォームリセットとオーバーレイ非表示
    setTimeout(() => {
      overlay.style.display = 'none';
      btn.disabled = false;
      form.reset();
    }, 4000);

  } catch (error) {
    // エラー時の処理
    overlay.style.display = 'none';
    btn.disabled = false;
    status.innerText = "エラーが発生しました。時間をおいて再度お試しください。";
    status.style.display = "block";
    status.style.color = "#ef4444";
  }
}

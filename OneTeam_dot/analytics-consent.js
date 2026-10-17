(() => {
  "use strict";
  const script = document.currentScript;
  const base = new URL(".", script.src);
  const measurementId = "G-MQDH7GZBZE";
  const storageKey = "oneteam_analytics_consent_v1";
  const japanese = (navigator.language || "").toLowerCase().startsWith("ja");
  const copy = japanese ? {
    message: "サイト改善のため、Cloudflare で Cookie を使わずにアクセス解析を行います。同意した場合のみ、Google Analytics と解析用 Cookie も使用します。",
    accept: "同意する", reject: "同意しない", settings: "Cookie 設定", policy: "Webサイトのプライバシーポリシー",
    title: "Cookie の設定", close: "閉じる"
  } : {
    message: "We use Cloudflare to measure visits without cookies. Google Analytics and its cookies are used only if you accept.",
    accept: "Accept", reject: "Decline", settings: "Cookie settings", policy: "Website privacy policy",
    title: "Cookie settings", close: "Close"
  };
  const policyUrl = new URL(japanese ? "privacy/ja/" : "privacy/en/", base).href;
  let choice = null;
  try { choice = localStorage.getItem(storageKey); } catch (_) { /* Storage may be unavailable. */ }
  if (choice !== "granted" && choice !== "denied") choice = null;

  function initCloudflare() {
    if (document.getElementById("oneteam-cloudflare-script")) return;
    const tag = document.createElement("script");
    tag.id = "oneteam-cloudflare-script";
    tag.type = "module";
    tag.src = "https://static.cloudflareinsights.com/beacon.min.js";
    tag.setAttribute("data-cf-beacon", JSON.stringify({ token: "ec2e793ba05b407c850abe90d8810461" }));
    document.head.appendChild(tag);
  }

  function initAnalytics() {
    if (choice !== "granted") return;
    window["ga-disable-" + measurementId] = false;
    if (document.getElementById("oneteam-ga-script")) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    // Basic Consent Mode: load Google only after analytics consent is granted.
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { allow_google_signals: false, allow_ad_personalization_signals: false });

    const tag = document.createElement("script");
    tag.id = "oneteam-ga-script";
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
  }

  function clearAnalyticsCookies() {
    const names = document.cookie.split(";").map((part) => part.trim().split("=")[0]);
    const paths = ["/"];
    const segments = location.pathname.split("/").filter(Boolean);
    for (let i = 1; i <= segments.length; i++) {
      const path = "/" + segments.slice(0, i).join("/");
      paths.push(path, path + "/");
    }
    const hosts = location.hostname.split(".");
    const domains = [""];
    for (let i = 0; i < hosts.length - 1; i++) domains.push("; domain=" + hosts.slice(i).join("."));
    for (const name of names) {
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const path of paths) for (const domain of domains) {
        document.cookie = name + "=; Max-Age=0; path=" + path + domain + "; SameSite=Lax";
      }
    }
  }

  function render() {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = new URL("analytics-consent.css", base).href;
    document.head.appendChild(css);
    const root = document.createElement("div");
    root.className = "ot-consent-root";
    const banner = document.createElement("section");
    banner.className = "ot-consent-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", copy.title);
    const message = document.createElement("p");
    message.textContent = copy.message + " ";
    const policy = document.createElement("a");
    policy.href = policyUrl;
    policy.textContent = copy.policy;
    message.appendChild(policy);
    const actions = document.createElement("div");
    actions.className = "ot-consent-actions";
    const decline = document.createElement("button");
    decline.type = "button";
    decline.textContent = copy.reject;
    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "ot-consent-accept";
    accept.textContent = copy.accept;
    actions.append(decline, accept);
    banner.append(message, actions);
    const settings = document.createElement("button");
    settings.type = "button";
    settings.className = "ot-consent-settings";
    settings.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>';
    settings.setAttribute("aria-label", copy.settings);
    settings.setAttribute("title", copy.settings);
    root.append(banner, settings);
    document.body.appendChild(root);
    let settingsOpen = false;
    function updateBanner() {
      const showBanner = choice === null || settingsOpen;
      banner.hidden = !showBanner;
      settings.hidden = showBanner;
    }
    function select(value) {
      choice = value;
      settingsOpen = false;
      try { localStorage.setItem(storageKey, value); } catch (_) { /* Choice lasts for this page only. */ }
      if (value === "granted") initAnalytics();
      if (value === "denied") {
        // A loaded Google tag cannot be unloaded; disable it before reloading
        // into a page that never loads Google. Do not send a denied-state ping.
        window["ga-disable-" + measurementId] = true;
        clearAnalyticsCookies();
        if (document.getElementById("oneteam-ga-script")) {
          location.reload();
          return;
        }
      }
      updateBanner();
    }
    decline.addEventListener("click", () => select("denied"));
    accept.addEventListener("click", () => select("granted"));
    settings.addEventListener("click", () => { settingsOpen = true; updateBanner(); accept.focus(); });
    updateBanner();
  }
  if (choice !== "granted") clearAnalyticsCookies();
  initCloudflare();
  initAnalytics();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, { once: true });
  else render();
})();


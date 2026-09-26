(() => {
  "use strict";
  const script = document.currentScript;
  const base = new URL(".", script.src);
  const measurementId = "G-MQDH7GZBZE";
  const storageKey = "oneteam_analytics_consent_v1";
  const japanese = (navigator.language || "").toLowerCase().startsWith("ja");
  const copy = japanese ? {
    message: "サイトの改善のため、同意いただいた場合のみ Google Analytics の Cookie を使用します。",
    accept: "同意する", reject: "同意しない", settings: "Cookie 設定", policy: "Webサイトのプライバシーポリシー",
    title: "Cookie の設定", close: "閉じる"
  } : {
    message: "With your permission, we use Google Analytics cookies to understand and improve this site.",
    accept: "Accept", reject: "Decline", settings: "Cookie settings", policy: "Website privacy policy",
    title: "Cookie settings", close: "Close"
  };
  const policyUrl = new URL(japanese ? "privacy/ja/" : "privacy/en/", base).href;
  let choice = null;
  try { choice = localStorage.getItem(storageKey); } catch (_) { /* Storage may be unavailable. */ }
  if (choice !== "granted" && choice !== "denied") choice = null;

  function initAnalytics() {
    if (document.getElementById("oneteam-ga-script")) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());

    const initialConsent = choice === "granted" ? "granted" : "denied";
    window.gtag("consent", "default", {
      analytics_storage: initialConsent,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
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
    for (let i = 1; i <= segments.length; i++) paths.push("/" + segments.slice(0, i).join("/") + "/");
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
    settings.textContent = copy.settings;
    settings.setAttribute("aria-label", copy.settings);
    root.append(banner, settings);
    document.body.appendChild(root);
    function updateBanner() { banner.hidden = choice !== null; settings.hidden = choice === null; }
    function select(value) {
      const prior = choice;
      choice = value;
      try { localStorage.setItem(storageKey, value); } catch (_) { /* Choice lasts for this page only. */ }
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: value === "granted" ? "granted" : "denied"
        });
      }
      if (value === "denied" && prior === "granted") {
        clearAnalyticsCookies();
      }
      updateBanner();
    }
    decline.addEventListener("click", () => select("denied"));
    accept.addEventListener("click", () => select("granted"));
    settings.addEventListener("click", () => { choice = null; updateBanner(); accept.focus(); });
    updateBanner();
  }
  initAnalytics();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, { once: true });
  else render();
})();


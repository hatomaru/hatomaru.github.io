(() => {
  if (window.location.protocol !== "file:") return;

  const resolveDirectoryLink = (link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const target = new URL(href, document.baseURI);
    if (target.protocol !== "file:" || !target.pathname.endsWith("/")) return;

    target.pathname += "index.html";
    link.href = target.href;
  };

  const updateLinks = (root) => {
    if (root.matches?.("a[data-file-index]")) resolveDirectoryLink(root);
    root
      .querySelectorAll?.("a[data-file-index]")
      .forEach(resolveDirectoryLink);
  };

  const start = () => {
    updateLinks(document);
    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) updateLinks(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

(() => {
  const script = document.currentScript;
  const source = script?.dataset.footerSrc || "/footer_O.html";
  const mount = document.getElementById("shared-footer");
  if (!mount) return;

  if (window.location.protocol === "file:") {
    const frame = document.createElement("iframe");
    frame.className = "shared-footer-frame";
    frame.title = "One Team. footer";
    frame.src = source;
    frame.addEventListener("load", () => {
      try {
        frame.contentDocument.body.style.margin = "0";
        frame.style.height = `${frame.contentDocument.documentElement.scrollHeight}px`;
      } catch {
        frame.style.height = "100px";
      }
    });
    mount.replaceWith(frame);
    return;
  }

  fetch(source, { credentials: "same-origin" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Footer request failed: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      mount.outerHTML = html;
    })
    .catch((error) => {
      console.warn("The shared footer could not be loaded.", error);
    });
})();

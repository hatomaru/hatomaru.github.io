(() => {
  const menuButton = document.querySelector(".hamb");
  const mobileMenu = document.getElementById("mobile-menu");
  const setMenu = (open) => {
    mobileMenu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuButton.addEventListener("click", () => setMenu(mobileMenu.hidden));
  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("scene");
  const context = canvas.getContext("2d");
  const blobs = Array.from({ length: 9 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    radius: 55 + Math.random() * 40,
    hue: (index * 47 + 175) % 360,
    speed: 0.00004 + Math.random() * 0.00005,
    phase: Math.random() * Math.PI * 2,
  }));
  let width = 0;
  let height = 0;
  let dpr = 1;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  window.addEventListener("resize", resize, { passive: true });
  resize();

  const draw = (time) => {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "screen";
    blobs.forEach((blob, index) => {
      const x = (blob.x * width + Math.sin(time * blob.speed + blob.phase) * width * 0.16 + width) % width;
      const y = (blob.y * height + Math.cos(time * blob.speed * 0.8 + blob.phase + index) * height * 0.12 + height) % height;
      const gradient = context.createRadialGradient(x, y, 0, x, y, blob.radius);
      gradient.addColorStop(0, `hsla(${blob.hue}, 88%, 67%, .52)`);
      gradient.addColorStop(1, `hsla(${blob.hue}, 88%, 67%, 0)`);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, blob.radius, 0, Math.PI * 2);
      context.fill();
    });
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();

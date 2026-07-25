(() => {
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("policy-scene");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const blobs = Array.from({ length: 8 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    radius: 52 + Math.random() * 42,
    hue: (index * 49 + 175) % 360,
    speed: 0.000035 + Math.random() * 0.000045,
    phase: Math.random() * Math.PI * 2,
  }));
  let width = 0;
  let height = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (time) => {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "screen";
    blobs.forEach((blob, index) => {
      const x =
        (blob.x * width +
          Math.sin(time * blob.speed + blob.phase) * width * 0.14 +
          width) %
        width;
      const y =
        (blob.y * height +
          Math.cos(time * blob.speed * 0.8 + blob.phase + index) *
            height *
            0.11 +
          height) %
        height;
      const gradient = context.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        blob.radius,
      );
      gradient.addColorStop(0, `hsla(${blob.hue}, 88%, 65%, .68)`);
      gradient.addColorStop(1, `hsla(${blob.hue}, 88%, 65%, 0)`);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, blob.radius, 0, Math.PI * 2);
      context.fill();
    });
    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();

// Screenshot carousel for pages/promo.html.
// Auto-scrolls continuously (same engine as the homepage design carousel in
// home.js): a duplicated set of slides loops seamlessly, drifting on its
// own, pausing on hover, and draggable by mouse. Prev/next buttons and dots
// sit on top of that and just nudge the same running offset.

const track = document.getElementById("wp-promo-carousel");
const inner = document.getElementById("wp-promo-carousel-inner");
const prevBtn = document.getElementById("wp-promo-prev");
const nextBtn = document.getElementById("wp-promo-next");
const dotsWrap = document.getElementById("wp-promo-dots");

if (track && inner && dotsWrap) {
  const originalSlides = Array.from(inner.children);
  const count = originalSlides.length;

  // Duplicate the set once so the loop has somewhere seamless to scroll into.
  originalSlides.forEach((slide) => inner.appendChild(slide.cloneNode(true)));

  // One dot per original slide.
  originalSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "wp-promo-dot";
    dot.setAttribute("aria-label", `Go to screenshot ${i + 1}`);
    dot.addEventListener("click", () => jumpToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  // Distance from one slide to the next (width + gap) — measured from the
  // rendered layout so it stays correct across breakpoints.
  let step = 0;
  function measureStep() {
    const slides = inner.children;
    if (slides.length > 1) {
      step = slides[1].offsetLeft - slides[0].offsetLeft;
    }
  }
  measureStep();
  window.addEventListener("resize", measureStep);

  const loopWidth = () => step * count;

  let currentTranslate = 0;
  let isHovering = false;
  let isDown = false;
  let hasMoved = false;
  let dragStartTranslate = 0;
  let startX = 0;

  track.addEventListener("mouseenter", () => { isHovering = true; });
  track.addEventListener("mouseleave", () => {
    isHovering = false;
    if (!isDown) return;
    isDown = false;
    track.style.cursor = "grab";
  });

  track.addEventListener("mousedown", (e) => {
    isDown = true;
    hasMoved = false;
    startX = e.pageX;
    dragStartTranslate = currentTranslate;
  });
  track.addEventListener("mouseup", () => {
    isDown = false;
    track.style.cursor = "grab";
  });
  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const moveX = e.pageX - startX;
    if (!hasMoved && Math.abs(moveX) > 4) {
      hasMoved = true;
      track.style.cursor = "grabbing";
    }
    currentTranslate = dragStartTranslate + moveX;
  });
  // After a real drag, swallow the click so it doesn't register as a tap.
  track.addEventListener("click", (e) => {
    if (hasMoved) {
      e.preventDefault();
      hasMoved = false;
    }
  }, true);

  function normalize() {
    const lw = loopWidth();
    if (lw <= 0) return;
    while (currentTranslate <= -lw) {
      currentTranslate += lw;
      dragStartTranslate += lw;
    }
    while (currentTranslate > 0) {
      currentTranslate -= lw;
      dragStartTranslate -= lw;
    }
  }

  function jumpToSlide(i) {
    currentTranslate = -i * step;
    normalize();
  }

  function activeIndex() {
    if (step <= 0) return 0;
    const lw = loopWidth();
    const pos = ((-currentTranslate % lw) + lw) % lw;
    return Math.round(pos / step) % count;
  }

  function updateDots() {
    const active = activeIndex();
    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
  }

  prevBtn?.addEventListener("click", () => { currentTranslate += step; normalize(); });
  nextBtn?.addEventListener("click", () => { currentTranslate -= step; normalize(); });

  let lastTime = 0;
  function loop(time) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (!isNaN(deltaTime) && deltaTime < 0.1 && !isDown && !isHovering) {
      currentTranslate -= deltaTime * 40; // drift speed, px/sec
    }

    normalize();
    inner.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
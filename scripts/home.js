// Parallax scroll effect
window.addEventListener('scroll', function() {
  // Get current vertical scroll position
  const scrollPosition = window.pageYOffset;

  // Select parallax background element and apply transform based on scroll position
  const bg = document.getElementById('wp-hero-bg');
  const speed = -0.9; // Adjust this value for different parallax speeds
  const yPos = -(scrollPosition * speed);
  bg.style.transform = `translateY(${yPos}px)`;

});

// Game Scrollbar

const scrollbar = document.querySelector(".wp-games-scroller-inner");
const cardTemplate = document.querySelector(".wp-card-template");

import { designs, designArt, designFull } from "./data.js"; // Import the design images from data.js

// index.html lives at the site root, so paths resolve with no prefix.
const BASE = "";

// Function to generate and append design cards
function appendDesignCards() {
  designs.forEach((design) => {
    const card = cardTemplate.content.cloneNode(true);

    const art = card.querySelector(".wp-card-art");
    art.style.background = designArt(design, BASE);
    art.style.backgroundSize = "cover";
    art.style.backgroundPosition = "center";
    art.style.backgroundRepeat = "no-repeat";
    art.style.backgroundAttachment = "fixed";

    const link = card.querySelector(".wp-card-link");
    link.setAttribute("href", "#");
    link.setAttribute("aria-label", design.alt || "View design");
    // Store the full-res image path so the click handler below can open it in the lightbox.
    link.dataset.fullImg = designFull(design, BASE);

    scrollbar.appendChild(card);
  });
}

// Fill the track with TWO identical copies of the list so the loop has something to scroll into seamlessly.
appendDesignCards();
appendDesignCards();

// Distance of one full set of cards
let loopWidth = 0;
function measureLoopWidth() {
  const cards = scrollbar.querySelectorAll(".wp-card-link");
  // card[designs.length] is the first card of the second copy.
  if (cards.length > designs.length) {
    loopWidth = cards[designs.length].offsetLeft - cards[0].offsetLeft;
  }
}
measureLoopWidth();
// Card widths are fixed, but remeasure on resize in case layout shifts.
window.addEventListener("resize", measureLoopWidth);

/* --- LIGHTBOX --- */

const lightbox = document.getElementById("wp-lightbox");
const lightboxImg = document.getElementById("wp-lightbox-img");
const lightboxClose = document.getElementById("wp-lightbox-close");

let lightboxOpen = false;

function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";

    lightbox.classList.add("wp-lightbox-open");
    lightboxOpen = true;
}

function closeLightbox() {
    lightbox.classList.remove("wp-lightbox-open");
    lightboxOpen = false;
}

/* Close button */
lightboxClose.addEventListener("click", closeLightbox);

/* Close when clicking the backdrop */
lightbox.addEventListener("click", (e) => {
    if (e.target !== lightboxImg) {
        closeLightbox();
    }
});

/* Escape key */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxOpen) {
        closeLightbox();
    }
});

/* --- CLICK AND DRAG CORE ENGINE --- */

let isHovering = false;
let isDown = false;
let hasMoved = false; // true once the pointer drags past the threshold

let currentTranslate = 0;     // live rendered offset
let dragStartTranslate = 0;   // offset captured at the moment a drag begins
let startX;                   // pointer x captured at the moment a drag begins

// Mouse Enters the Container Window
scrollbar.addEventListener("mouseenter", () => {
  isHovering = true;
  // Pause the auto-scroll when the user hovers over the container
  scrollbar.style.animationPlayState = "paused";
});
// Mouse Leaves the Container Window
scrollbar.addEventListener("mouseleave", () => {
  isHovering = false;

  if (!isDown) return;
  isDown = false;
  scrollbar.classList.remove("is-grabbing");
});

// Mouse Down
scrollbar.addEventListener("mousedown", (e) => {
  isDown = true;
  hasMoved = false; // reset: a new press starts as a potential click
  startX = e.pageX;
  dragStartTranslate = currentTranslate; // anchor the drag to where it is now
});
// Mouse Button Released
scrollbar.addEventListener("mouseup", () => {
  if (!isDown) return;
  isDown = false;
  scrollbar.classList.remove("is-grabbing");
});

//Mouse Moving
scrollbar.addEventListener("mousemove", (e) => {
  if (!isDown) return;

  e.preventDefault(); // Stop text highlights or image drag ghosts

  // Calculate how many pixels the mouse shifted
  const moveX = e.pageX - startX;

  // Only count it as a drag once the pointer passes a small threshold
  if (!hasMoved && Math.abs(moveX) > 4) {
    hasMoved = true;
    scrollbar.classList.add("is-grabbing");
  }

  // Offset from the position the drag started at
  currentTranslate = dragStartTranslate + moveX;

});

// After a drag, cancel the click instead of following the link;
// otherwise, if it landed on a card, open that design in the lightbox.
scrollbar.addEventListener("click", (e) => {
  if (hasMoved) {
    e.preventDefault();
    e.stopPropagation();
    hasMoved = false;
    return;
  }

  const card = e.target.closest(".wp-card-link");
  if (!card || !card.dataset.fullImg) return;
  e.preventDefault();
  openLightbox(card.dataset.fullImg, card.getAttribute("aria-label"));
}, true);

let lastTime = 0;
function updateLoop(currentTime) {

  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Auto-scroll when the user isn't dragging, and isn't hovering — unless the
  // lightbox is open, in which case we keep it moving in the background regardless.
  if (!isNaN(deltaTime) && deltaTime < 0.1 && !isDown && (!isHovering || lightboxOpen)) {
    //Multiply your value by deltaTime
    currentTranslate -= deltaTime * 60; // Adjust the multiplier for speed
  }

  // Seamless loop
  if (loopWidth > 0) {
    while (currentTranslate <= -loopWidth) {
      currentTranslate += loopWidth;
      dragStartTranslate += loopWidth;
    }
    while (currentTranslate > 0) {
      currentTranslate -= loopWidth;
      dragStartTranslate -= loopWidth;
    }
  }

  scrollbar.style.transform = `translateX(${currentTranslate}px)`;
  requestAnimationFrame(updateLoop);
}
updateLoop();
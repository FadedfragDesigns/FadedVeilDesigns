// Design Gallery page — reuses the same designs data + image-only card
// template as the home page's carousel, but lays every card out in a
// vertical, wrapping grid instead of an auto-scroller. Clicking a card
// opens the same lightbox pattern used on the home page (no separate
// per-design detail page — pagegame.html is no longer used here).

import { designs, designArt, designFull } from "./data.js"; // same source of truth as index.html

// gamelibrary.html lives in pages/, so paths resolve one level up.
const BASE = "../";

const grid = document.querySelector(".wp-library-grid");
const cardTemplate = document.querySelector(".wp-card-template");

// Build a single card from a design object (mirrors home.js).
function buildDesignCard(design) {
  const card = cardTemplate.content.cloneNode(true);

  const art = card.querySelector(".wp-card-art");
  art.style.background = designArt(design, BASE);
  art.style.backgroundSize = "cover";
  art.style.backgroundPosition = "center";
  art.style.backgroundRepeat = "no-repeat";

  const link = card.querySelector(".wp-card-link");
  link.setAttribute("href", "#");
  link.setAttribute("aria-label", design.alt || "View design");
  link.dataset.fullImg = designFull(design, BASE);

  return card;
}

// Render every design once into the grid.
function renderLibrary() {
  designs.forEach((design) => grid.appendChild(buildDesignCard(design)));
}

renderLibrary();

/* --- LIGHTBOX (same pattern as home.js) --- */

const lightbox = document.getElementById("wp-lightbox");
const lightboxImg = document.getElementById("wp-lightbox-img");
const lightboxClose = document.getElementById("wp-lightbox-close");
const lightboxBackdrop = document.getElementById("wp-lightbox-backdrop");

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

// No drag-to-scroll on this page (it's a static wrapping grid, not the
// horizontal auto-scroller), so a plain click listener is all we need.
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".wp-card-link");
  if (!card || !card.dataset.fullImg) return;
  e.preventDefault();
  openLightbox(card.dataset.fullImg, card.getAttribute("aria-label"));
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxBackdrop.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightboxOpen) closeLightbox();
});
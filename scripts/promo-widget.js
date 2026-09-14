// Floating "product promo" widget (bottom-right icon).
// Waits for the CSS entrance animation (see #wp-promo-widget in styles.css)
// to finish, then adds .wp-promo-settled so the "Click me" label fades in
// and the pulsing ring starts. If the browser has reduced-motion on, or the
// animation somehow never fires, we still reveal the label after a fallback
// timeout so the widget never gets stuck looking half-finished.

const promoWidget = document.getElementById("wp-promo-widget");

if (promoWidget) {
  let settled = false;

  function settle() {
    if (settled) return;
    settled = true;
    promoWidget.classList.add("wp-promo-settled");
  }

  promoWidget.addEventListener("animationend", (e) => {
    if (e.animationName === "wppromo-in") settle();
  });

  // Fallback in case the animation is skipped (e.g. prefers-reduced-motion).
  window.setTimeout(settle, 2200);
}

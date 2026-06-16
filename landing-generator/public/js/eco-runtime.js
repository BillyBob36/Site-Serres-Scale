/**
 * Mini runtime côté client pour les pages clones d'ecoenvironnement.net.
 *  - Carousels (Swiper) : duplique les slides puis anime le wrapper en translateX
 *    pour un effet marquee continu, basé sur la largeur RÉELLE mesurée.
 *  - Mega-menu CSS-only : déjà géré via :hover dans le CSS.
 *
 * Pas de dépendance externe. Indempotent (data-eco-marquee-init).
 */
(function () {
  "use strict";

  function setupMarquee(wrapper, opts) {
    if (!wrapper || wrapper.dataset.ecoMarqueeInit === "1") return;
    var slides = Array.prototype.slice.call(wrapper.children);
    if (slides.length === 0) return;

    // Duplique tous les slides une fois (pour boucle visuellement infinie)
    slides.forEach(function (s) {
      var c = s.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.dataset.ecoClone = "1";
      wrapper.appendChild(c);
    });

    // Style requis : flex + width auto + transform animée
    wrapper.style.display = "flex";
    wrapper.style.width = "max-content";
    wrapper.style.transform = "translateX(0)";
    wrapper.style.willChange = "transform";

    // Mesure la largeur d'un cycle (slides originaux uniquement) après reflow
    requestAnimationFrame(function () {
      var totalOriginalWidth = 0;
      var firstHalf = wrapper.querySelectorAll(":scope > :not([data-eco-clone='1'])");
      firstHalf.forEach(function (s) {
        var rect = s.getBoundingClientRect();
        var style = getComputedStyle(s);
        var marginRight = parseFloat(style.marginRight) || 0;
        totalOriginalWidth += rect.width + marginRight;
      });
      if (totalOriginalWidth < 50) return;

      var speedPxPerSec = opts.speed || 60; // px/s
      var durationSec = totalOriginalWidth / speedPxPerSec;

      // Animation via Web Animations API (plus fiable que CSS keyframes pour valeur dynamique)
      wrapper.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-" + totalOriginalWidth + "px)" },
        ],
        {
          duration: durationSec * 1000,
          iterations: Infinity,
          easing: "linear",
        },
      );
    });

    wrapper.dataset.ecoMarqueeInit = "1";

    // Pause au survol via attribut (la propriété animation-play-state n'existe pas
    // pour Web Animations sans référence; on utilise pause/resume dynamique)
    var anim = null;
    wrapper.addEventListener("mouseenter", function () {
      if (!anim) {
        var anims = wrapper.getAnimations && wrapper.getAnimations();
        if (anims && anims.length) anim = anims[0];
      }
      if (anim) anim.pause();
    });
    wrapper.addEventListener("mouseleave", function () {
      if (anim) anim.play();
    });
  }

  // ─── Header : hide-on-scroll-down, show-on-scroll-up ───
  function setupStickyHeader() {
    var header = document.querySelector("header.elementor-location-header");
    if (!header) return;
    var lastY = window.scrollY || 0;
    var ticking = false;
    var SHOW_BELOW = 80; // toujours visible si on est en haut
    var DELTA = 6;       // seuil mini pour basculer

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var diff = y - lastY;
        // En haut de page → toujours visible
        if (y < SHOW_BELOW) {
          header.removeAttribute("data-eco-hide");
        } else if (diff > DELTA) {
          // scroll vers le bas
          header.setAttribute("data-eco-hide", "1");
        } else if (diff < -DELTA) {
          // scroll vers le haut
          header.removeAttribute("data-eco-hide");
        }
        lastY = y;
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ─── Mobile : burger toggle ───
  function setupMobileMenu() {
    var header = document.querySelector("header.elementor-location-header");
    if (!header) return;
    var toggles = header.querySelectorAll(".e-n-menu-toggle");
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var open = header.getAttribute("data-eco-mobile-open") === "1";
        if (open) {
          header.removeAttribute("data-eco-mobile-open");
          btn.setAttribute("aria-expanded", "false");
        } else {
          header.setAttribute("data-eco-mobile-open", "1");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
    // Ferme le drawer en cliquant un lien à l'intérieur
    header.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.removeAttribute("data-eco-mobile-open");
      });
    });
  }

  function init() {
    // Carousels Elementor : .swiper > .swiper-wrapper
    document.querySelectorAll(".swiper .swiper-wrapper").forEach(function (w) {
      setupMarquee(w, { speed: 50 });
    });
    document.querySelectorAll(".e-n-carousel .swiper-wrapper").forEach(function (w) {
      setupMarquee(w, { speed: 50 });
    });
    setupStickyHeader();
    setupMobileMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

import * as cheerio from "cheerio";

/**
 * Nettoie le HTML single-file de la page « À propos » (ecoenvironnement.net) :
 * popups, bannière cookies, bloc vidéo + titre « Nos collaborateurs », LinkedIn.
 * Le reste (CSS inline, structure Elementor) est conservé pour garder la même mise en page.
 */
export function cleanScrapedAboutHtml(raw: string): string {
  const $ = cheerio.load(raw);

  // --- Popups / cookies (CookieYes + overlays) ---
  $(
    [
      ".cky-consent-container",
      ".cky-modal",
      ".cky-overlay",
      ".cky-btn-revisit-wrapper",
      "#ckyBanner",
      "style#cky-style",
    ].join(", "),
  ).remove();
  // Restes CookieYes (ciblé pour éviter de parcourir tous les nœuds du single-file)
  $("div[class*='cky-'], button[class*='cky-'], span[class*='cky-'], section[class*='cky-']").remove();

  // Elementor popups (ex. « Usurpation de notre nom »)
  $(
    [
      ".elementor-popup-modal",
      ".dialog-widget.dialog-lightbox-widget",
      '[data-elementor-type="popup"]',
      '[id^="elementor-popup-modal"]',
    ].join(", "),
  ).remove();

  // --- Bloc entier « Nos collaborateurs » + playlist vidéo (même parent e-con) ---
  $(".elementor-widget-video-playlist").each((_, el) => {
    const $w = $(el);
    const $block = $w.closest(".elementor-element.e-con.e-child");
    if ($block.length) {
      $block.remove();
    } else {
      $w.remove();
    }
  });
  $("iframe[src*='youtube'], iframe[src*='youtu.be']").remove();
  $("video").remove();

  // --- LinkedIn : liens + widgets réseaux qui les contiennent ---
  $("a[href*='linkedin']").each((_, el) => {
    const $a = $(el);
    const $widget = $a.closest(".elementor-widget-social-icons");
    if ($widget.length) {
      $widget.remove();
    } else {
      $a.remove();
    }
  });

  // Scripts susceptibles de rouvrir cookies / popups (la page reste statique)
  $("script").each((_, el) => {
    const src = ($(el).attr("src") || "").toLowerCase();
    const inline = ($(el).html() || "").toLowerCase();
    if (
      src.includes("cookieyes") ||
      src.includes("cky") ||
      inline.includes("cookieyes") ||
      inline.includes("cky-consent") ||
      inline.includes("elementor-popup") ||
      inline.includes("elementor_pro_popup")
    ) {
      $(el).remove();
    }
  });

  // Fallback CSS : rien ne doit recouvrir la page
  $("head").append(`<style id="about-static-cleanup">
.cky-consent-container,.cky-modal,.cky-overlay,.cky-btn-revisit-wrapper,
.elementor-popup-modal,.dialog-widget.dialog-lightbox-widget,
[data-elementor-type="popup"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
</style>`);

  return $.html();
}

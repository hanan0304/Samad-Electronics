"use client";

import { useEffect } from "react";

/**
 * Reveals elements as they scroll into view.
 *
 * Mounted once in the storefront layout. Any element anywhere on the site can
 * opt in by adding `data-reveal` — no wrapper component and no extra client
 * boundary needed, so pages stay server-rendered.
 *
 * The CSS that hides elements is scoped to `.js-reveal`, which is only added
 * here. If JavaScript fails or is disabled, nothing is ever hidden.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Optional stagger: data-reveal-delay="120" (milliseconds)
          const delay = Number(el.dataset.revealDelay || 0);
          if (delay > 0) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    function scan() {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
        .forEach((el) => io.observe(el));
    }
    scan();

    // Client-side navigation swaps the page contents, so re-scan when the DOM
    // changes — batched with rAF so a busy page does not thrash.
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);

  return null;
}

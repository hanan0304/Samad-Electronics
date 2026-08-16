"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
};

/**
 * Hero slides. The first slide carries the page's <h1> (the main SEO heading);
 * the rest are <h2> so the page keeps exactly one h1.
 * To change a photo, drop a new file into /public/slider and update `image`.
 */
const SLIDES: Slide[] = [
  {
    image: "/slider/slide-2.jpg",
    eyebrow: "Electric · Sanitary · Fancy Lights",
    title: "Everything for your home’s electrical, sanitary & lighting needs",
    text: `${siteConfig.name} is your one-stop shop in ${siteConfig.city} for quality electrical goods, bathroom fittings, sanitary ware and beautiful fancy lights — at honest, up-to-date prices.`,
    primary: { href: "/products", label: "Browse Products" },
    secondary: { href: "/quotation", label: "Request a Quotation" },
  },
  {
    image: "/slider/slide-3.jpg",
    eyebrow: "Sanitary & Bathroom",
    title: "Bathrooms that feel brand new",
    text: "Wash basins, commodes, showers, premium faucets and all the fittings behind them — for every budget, from renovation to new build.",
    primary: { href: "/sanitary", label: "Shop Sanitary" },
    secondary: { href: "/quotation", label: "Request a Quotation" },
  },
  {
    image: "/slider/slide-4.jpg",
    eyebrow: "Fancy Lights",
    title: "Lighting that transforms a room",
    text: "Chandeliers, pendants, wall lights and LED strips to finish your home beautifully — chosen from brands you can trust.",
    primary: { href: "/fancy-lights", label: "Shop Fancy Lights" },
    secondary: { href: "/products", label: "Browse All Products" },
  },
];

const INTERVAL = 6500;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );

  // Auto-advance, unless the visitor is hovering/focusing the slider or has
  // asked the system to reduce motion.
  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured departments"
      className="relative isolate overflow-hidden bg-brand-darker text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Background photos (cross-fade) */}
      <div className="absolute inset-0 -z-10">
        {SLIDES.map((s, i) => (
          <Image
            key={s.image}
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn(
              "object-cover transition-opacity duration-700 ease-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Scrim keeps the copy readable over any photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-darker/85 to-brand-darker/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darker/70 via-transparent to-transparent" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        />
      </div>

      {/* Slide copy — all slides stay in the DOM so crawlers see them */}
      <div className="container-page relative grid min-h-[26rem] items-center py-16 sm:min-h-[30rem] lg:min-h-[34rem]">
        {SLIDES.map((s, i) => {
          const active = i === index;
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div
              key={s.image}
              aria-hidden={!active}
              className={cn(
                "col-start-1 row-start-1 max-w-2xl transition-all duration-500 ease-out",
                active
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0"
              )}
            >
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                {s.eyebrow}
              </span>
              <Heading className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                {s.title}
              </Heading>
              <p className="mt-4 max-w-xl text-white/85">{s.text}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={s.primary.href}
                  tabIndex={active ? 0 : -1}
                  className={buttonClasses("accent", "lg")}
                >
                  {s.primary.label} <ArrowRight className="h-4 w-4" />
                </Link>
                {s.secondary && (
                  <Link
                    href={s.secondary.href}
                    tabIndex={active ? 0 : -1}
                    className={buttonClasses(
                      "outline",
                      "lg",
                      "border-white/40 !text-white hover:bg-white/10"
                    )}
                  >
                    {s.secondary.label}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/30 p-3 text-white backdrop-blur transition hover:bg-black/50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/30 p-3 text-white backdrop-blur transition hover:bg-black/50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots — the button carries a 44px tap area, the bar inside is the visual */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        {SLIDES.map((s, i) => (
          <button
            key={s.image}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className="grid place-items-center px-2 py-3.5"
          >
            <span
              className={cn(
                "block h-2.5 rounded-full transition-all duration-300",
                i === index
                  ? "w-8 bg-accent"
                  : "w-2.5 bg-white/45 hover:bg-white/70"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

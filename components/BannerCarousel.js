'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Design tokens — shared black/white/gold system
const INK = '#000000';
const GOLD = '#C9A227';
const PAPER = '#FFFFFF';

const AUTOPLAY_MS = 4500;

// Static style objects: created once, not on every render
const SECTION_STYLE = { background: PAPER };
const ARROW_STYLE = { background: PAPER, color: INK, border: `1px solid ${GOLD}` };

const Dot = memo(function Dot({ active, onSelect, index }) {
  return (
    <button
      onClick={() => onSelect(index)}
      className="rounded-full transition-all"
      style={{
        height: '3px',
        width: active ? '22px' : '10px',
        background: active ? GOLD : 'rgba(255,255,255,0.7)',
        boxShadow: active ? '0 0 0 1px rgba(0,0,0,0.25)' : '0 0 0 1px rgba(0,0,0,0.15)',
      }}
      aria-label={`Go to slide ${index + 1}`}
    />
  );
});

export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = banners?.length ?? 0;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  // Pause autoplay when the tab is hidden (saves CPU/battery and avoids queued re-renders)
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // setTimeout keyed on `index`: a manual click restarts the full delay
  // instead of the old interval firing right after the click.
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, count, paused, next]);

  if (!count) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={SECTION_STYLE}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full aspect-[1920/810]">
        {banners.map((b, i) => {
          const active = i === index;
          // Only mount images for the current slide and its neighbours.
          // The rest don't download until they're about to be shown.
          const nearby =
            active || i === (index + 1) % count || i === (index - 1 + count) % count;

          return (
            <Link
              key={b._id}
              href={b.link || '#'}
              prefetch={false}
              className={`absolute inset-0 block transition-opacity duration-700 ${
                active ? 'opacity-100 z-[1]' : 'opacity-0 pointer-events-none'
              } ${!b.link ? 'pointer-events-none' : ''}`}
              tabIndex={active ? 0 : -1}
              aria-hidden={!active}
            >
              {nearby && (
                <img
                  src={b.image}
                  alt={b.title || 'Banner'}
                  // First banner is the LCP element: load it eagerly with high priority
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                  width={1920}
                  height={810}
                  className="absolute inset-0 w-full h-full object-contain object-center sm:object-cover"
                />
              )}
            </Link>
          );
        })}

        {count > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 p-1 sm:p-2 rounded-full transition z-10"
              style={ARROW_STYLE}
              aria-label="Previous"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 p-1 sm:p-2 rounded-full transition z-10"
              style={ARROW_STYLE}
              aria-label="Next"
            >
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>

            <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((b, i) => (
                <Dot key={b._id} index={i} active={i === index} onSelect={setIndex} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
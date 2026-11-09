import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mediaUrl } from '../lib/api.js';

export default function Lightbox({ images, index, onIndex, onClose }) {
  const touch = useRef(null);
  const count = images.length;
  const go = (d) => onIndex((index + d + count) % count);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') onIndex((i) => (i - 1 + count) % count);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [count, onClose, onIndex]);

  const img = images[index];
  if (!img) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/96 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <img
        src={mediaUrl(img.url)}
        alt={img.alt || img.caption || ''}
        className="max-h-[86vh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {(img.caption || count > 1) && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/50 px-4 py-2 text-sm text-white/85">
          {img.caption && <span>{img.caption}</span>}
          {count > 1 && (
            <span className="text-white/55">
              {index + 1} / {count}
            </span>
          )}
        </div>
      )}
      <button type="button" aria-label="Close" onClick={onClose} className="absolute top-5 right-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
        <X className="h-6 w-6" />
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Magnetic cursor that morphs into a "View" pill over [data-cursor="view"] targets.
 *
 * Performance:
 *  - pointermove events are coalesced through a single requestAnimationFrame loop.
 *  - The target's bounding rect is cached on pointerover, and only refreshed on
 *    scroll / resize — never on every pointer move (no layout thrashing).
 */
const CustomCursor = () => {
  const [isView, setIsView] = useState(false);
  const [visible, setVisible] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const x = useSpring(mx, { stiffness: 480, damping: 38, mass: 0.45 });
  const y = useSpring(my, { stiffness: 480, damping: 38, mass: 0.45 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    setVisible(true);

    let targetEl: HTMLElement | null = null;
    let targetRect: DOMRect | null = null;
    let pendingX = 0;
    let pendingY = 0;
    let hasPending = false;
    let rafId = 0;

    const flush = () => {
      rafId = 0;
      if (!hasPending) return;
      hasPending = false;

      if (targetEl && targetRect) {
        const r = targetRect;
        const inside =
          pendingX >= r.left &&
          pendingX <= r.right &&
          pendingY >= r.top &&
          pendingY <= r.bottom;
        if (inside) {
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const pull = 0.18; // subtle magnetic snap toward center
          mx.set(pendingX + (cx - pendingX) * pull);
          my.set(pendingY + (cy - pendingY) * pull);
          return;
        }
        // Pointer drifted out without firing pointerout — clear.
        targetEl = null;
        targetRect = null;
        setIsView(false);
      }
      mx.set(pendingX);
      my.set(pendingY);
    };

    const schedule = (clientX: number, clientY: number) => {
      pendingX = clientX;
      pendingY = clientY;
      hasPending = true;
      if (!rafId) rafId = requestAnimationFrame(flush);
    };

    const onMove = (e: PointerEvent) => schedule(e.clientX, e.clientY);

    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor="view"]');
      if (t && t !== targetEl) {
        targetEl = t;
        targetRect = t.getBoundingClientRect(); // read once, cached
        setIsView(true);
      }
    };

    const onOut = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor="view"]');
      if (!t || t !== targetEl) return;
      const related = e.relatedTarget as Node | null;
      if (!related || !t.contains(related)) {
        targetEl = null;
        targetRect = null;
        setIsView(false);
      }
    };

    // Recompute cached rect lazily on scroll/resize, never on every move.
    const invalidateRect = () => {
      if (targetEl) targetRect = targetEl.getBoundingClientRect();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerout', onOut, { passive: true });
    window.addEventListener('scroll', invalidateRect, { passive: true });
    window.addEventListener('resize', invalidateRect, { passive: true });
    document.documentElement.style.cursor = 'none';

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerout', onOut);
      window.removeEventListener('scroll', invalidateRect);
      window.removeEventListener('resize', invalidateRect);
      document.documentElement.style.cursor = '';
    };
  }, [mx, my]);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        borderRadius: 9999,
        mixBlendMode: isView ? 'normal' : 'difference',
      }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center"
      animate={{
        width: isView ? 104 : 16,
        height: isView ? 104 : 16,
        backgroundColor: isView ? 'rgba(245, 240, 230, 0.96)' : 'rgba(245, 240, 230, 1)',
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.5 }}
    >
      <motion.span
        initial={false}
        animate={{ opacity: isView ? 1 : 0, scale: isView ? 1 : 0.6 }}
        transition={{ duration: 0.22 }}
        className="flex items-center gap-1"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#0a0a0a',
          fontWeight: 500,
        }}
      >
        View
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </motion.span>
    </motion.div>
  );
};

export default CustomCursor;

import { useCallback, useRef, useState } from 'react';

/**
 * Minimal pointer-based drag-to-reorder for vertical lists.
 * Works with mouse, touch and pen (HTML5 drag-and-drop doesn't work on touch screens).
 * Attach `handleProps(i)` to a drag handle and `itemRef(i)` to each row.
 */
export function useSortable(count: number, onMove: (from: number, to: number) => void) {
  const items = useRef<(HTMLElement | null)[]>([]);
  const [drag, setDrag] = useState<{ from: number; over: number; dy: number } | null>(null);
  const start = useRef<{ y: number; from: number; mids: number[] } | null>(null);

  const itemRef = useCallback((i: number) => (el: HTMLElement | null) => { items.current[i] = el; }, []);

  const handleProps = (i: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const mids = items.current.slice(0, count).map((el) => {
        const r = el?.getBoundingClientRect();
        return r ? r.top + r.height / 2 : 0;
      });
      start.current = { y: e.clientY, from: i, mids };
      setDrag({ from: i, over: i, dy: 0 });
    },
    onPointerMove: (e: React.PointerEvent) => {
      const s = start.current;
      if (!s) return;
      const dy = e.clientY - s.y;
      const y = s.mids[s.from] + dy;
      let over = s.mids.findIndex((m) => y < m);
      if (over === -1) over = s.mids.length - 1;
      else if (over > s.from) over -= 1;
      setDrag({ from: s.from, over, dy });
    },
    onPointerUp: () => {
      const s = start.current;
      start.current = null;
      setDrag((d) => {
        if (s && d && d.over !== d.from) onMove(d.from, d.over);
        return null;
      });
    },
    onPointerCancel: () => {
      start.current = null;
      setDrag(null);
    },
    style: { touchAction: 'none' as const, cursor: drag ? 'grabbing' : 'grab' },
  });

  /** Visual offset for each row while dragging. */
  const rowStyle = (i: number): React.CSSProperties => {
    if (!drag) return {};
    if (i === drag.from) return { transform: `translateY(${drag.dy}px)`, zIndex: 10, position: 'relative' };
    const h = items.current[drag.from]?.getBoundingClientRect().height ?? 0;
    const gap = 8;
    if (drag.from < drag.over && i > drag.from && i <= drag.over) return { transform: `translateY(${-(h + gap)}px)`, transition: 'transform 150ms' };
    if (drag.from > drag.over && i < drag.from && i >= drag.over) return { transform: `translateY(${h + gap}px)`, transition: 'transform 150ms' };
    return { transition: 'transform 150ms' };
  };

  return { itemRef, handleProps, rowStyle, dragging: drag?.from ?? null };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/hooks/useEditorStore';

interface Rect { x: number; y: number; w: number; h: number; }

type Handle =
  | 'n' | 's' | 'e' | 'w'
  | 'nw' | 'ne' | 'sw' | 'se';

const MIN_SIZE = 40;

// Positions for the 8 handles as fractions of rect width/height
const HANDLE_POSITIONS: { id: Handle; cx: number; cy: number; cursor: string }[] = [
  { id: 'nw', cx: 0,   cy: 0,   cursor: 'nw-resize' },
  { id: 'n',  cx: 0.5, cy: 0,   cursor: 'n-resize'  },
  { id: 'ne', cx: 1,   cy: 0,   cursor: 'ne-resize' },
  { id: 'w',  cx: 0,   cy: 0.5, cursor: 'w-resize'  },
  { id: 'e',  cx: 1,   cy: 0.5, cursor: 'e-resize'  },
  { id: 'sw', cx: 0,   cy: 1,   cursor: 'sw-resize' },
  { id: 's',  cx: 0.5, cy: 1,   cursor: 's-resize'  },
  { id: 'se', cx: 1,   cy: 1,   cursor: 'se-resize' },
];

export default function CropOverlay({
  canvasWidth,
  canvasHeight,
}: {
  canvasWidth: number;
  canvasHeight: number;
}) {
  const { setCropMode, cropCanvas } = useEditorStore();

  // Crop rect in canvas coordinates
  const [rect, setRect] = useState<Rect>({
    x: 0, y: 0, w: canvasWidth, h: canvasHeight,
  });

  const dragging = useRef<{
    handle: Handle | 'move';
    startMouse: { x: number; y: number };
    startRect: Rect;
  } | null>(null);

  const clamp = useCallback((r: Rect): Rect => ({
    x: Math.max(0, Math.min(r.x, canvasWidth - MIN_SIZE)),
    y: Math.max(0, Math.min(r.y, canvasHeight - MIN_SIZE)),
    w: Math.max(MIN_SIZE, Math.min(r.w, canvasWidth - r.x)),
    h: Math.max(MIN_SIZE, Math.min(r.h, canvasHeight - r.y)),
  }), [canvasWidth, canvasHeight]);

  function startDrag(e: React.MouseEvent, handle: Handle | 'move') {
    e.preventDefault();
    dragging.current = {
      handle,
      startMouse: { x: e.clientX, y: e.clientY },
      startRect: { ...rect },
    };
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return;
      const { handle, startMouse, startRect } = dragging.current;
      const dx = e.clientX - startMouse.x;
      const dy = e.clientY - startMouse.y;
      let { x, y, w, h } = startRect;

      if (handle === 'move') {
        x = Math.max(0, Math.min(x + dx, canvasWidth - w));
        y = Math.max(0, Math.min(y + dy, canvasHeight - h));
      } else {
        if (handle.includes('n')) { y += dy; h -= dy; }
        if (handle.includes('s')) { h += dy; }
        if (handle.includes('w')) { x += dx; w -= dx; }
        if (handle.includes('e')) { w += dx; }
      }

      setRect(clamp({ x, y, w, h }));
    }

    function onUp() { dragging.current = null; }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [canvasWidth, canvasHeight, clamp]);

  function handleConfirm() {
    cropCanvas(rect.x, rect.y, rect.w, rect.h);
  }

  return (
    <div
      className="absolute inset-0 z-20"
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      {/* Dark mask — 4 rects around the crop rect */}
      <svg
        width={canvasWidth}
        height={canvasHeight}
        className="pointer-events-none absolute inset-0"
      >
        <defs>
          <mask id="crop-mask">
            <rect width={canvasWidth} height={canvasHeight} fill="white" />
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="black" />
          </mask>
        </defs>
        <rect
          width={canvasWidth}
          height={canvasHeight}
          fill="rgba(0,0,0,0.55)"
          mask="url(#crop-mask)"
        />
        {/* Crop border */}
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.w}
          height={rect.h}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="6 3"
        />
        {/* Rule-of-thirds grid */}
        {[1, 2].map(i => (
          <g key={i}>
            <line
              x1={rect.x + (rect.w / 3) * i} y1={rect.y}
              x2={rect.x + (rect.w / 3) * i} y2={rect.y + rect.h}
              stroke="rgba(255,255,255,0.25)" strokeWidth={1}
            />
            <line
              x1={rect.x} y1={rect.y + (rect.h / 3) * i}
              x2={rect.x + rect.w} y2={rect.y + (rect.h / 3) * i}
              stroke="rgba(255,255,255,0.25)" strokeWidth={1}
            />
          </g>
        ))}
      </svg>

      {/* Drag-to-move interior */}
      <div
        className="absolute cursor-move"
        style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        onMouseDown={e => startDrag(e, 'move')}
      />

      {/* Resize handles */}
      {HANDLE_POSITIONS.map(({ id, cx, cy, cursor }) => (
        <div
          key={id}
          onMouseDown={e => startDrag(e, id)}
          className="absolute z-10 h-3 w-3 rounded-sm border-2 border-white bg-[#3b82f6]"
          style={{
            cursor,
            left: rect.x + rect.w * cx - 6,
            top:  rect.y + rect.h * cy - 6,
          }}
        />
      ))}

      {/* Confirm / Cancel buttons */}
      <div
        className="absolute flex gap-2"
        style={{
          left: rect.x + rect.w / 2,
          top: rect.y + rect.h + 10,
          transform: 'translateX(-50%)',
        }}
      >
        <button
          onClick={handleConfirm}
          className="rounded-md bg-[#3b82f6] px-3 py-1 text-xs font-semibold text-white shadow hover:bg-[#2563eb] transition-colors"
        >
          Apply Crop
        </button>
        <button
          onClick={() => setCropMode(false)}
          className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1 text-xs font-semibold text-foreground shadow hover:bg-[#2a2a2a] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

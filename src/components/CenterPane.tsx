'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import { useEditorStore, type ImageLayer } from '@/hooks/useEditorStore';

export const CANVAS_WIDTH = 600;

/** Loads an image src → HTMLImageElement, returns null while loading. */
function useHTMLImage(src: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) { setImg(null); return; }
    const el = new window.Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => setImg(el);
    el.src = src;
  }, [src]);
  return img;
}

/** Renders a single ImageLayer onto the Konva canvas. */
function CanvasImageNode({
  layer,
  offsetY,
}: {
  layer: ImageLayer;
  offsetY: number;
}) {
  const imgSrc = layer.src.startsWith('blob:') ? layer.src : layer.src;
  const img = useHTMLImage(imgSrc);
  if (!img) return null;
  return (
    <KonvaImage
      image={img}
      x={layer.x}
      y={layer.y + offsetY}
      width={layer.width}
      height={layer.height}
      opacity={layer.opacity}
      visible={layer.visible}
      draggable={false}
      listening={false}
    />
  );
}

export default function CenterPane() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { layers, canvasPaddingTop, canvasPaddingBottom } = useEditorStore();

  const imageLayer = layers.find((l): l is ImageLayer => l.type === 'image');

  const canvasHeight =
    (imageLayer?.height ?? 400) + canvasPaddingTop + canvasPaddingBottom;

  return (
    <main className="flex h-full flex-1 flex-col items-center overflow-y-auto bg-[#111]">
      {/* Toolbar placeholder — implemented in Step 11 */}
      <div className="flex w-full shrink-0 items-center gap-1 border-b border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2">
        <span className="text-xs text-muted-foreground">Toolbar</span>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 items-start justify-center py-8">
        <div
          className="relative shadow-2xl"
          style={{ width: CANVAS_WIDTH }}
        >
          {mounted && (
            <Stage width={CANVAS_WIDTH} height={canvasHeight}>
              <Layer>
                {/* White canvas background */}
                <Rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={canvasHeight}
                  fill="#ffffff"
                  listening={false}
                />

                {/* Image layers */}
                {layers
                  .filter((l): l is ImageLayer => l.type === 'image' && l.visible)
                  .map(l => (
                    <CanvasImageNode
                      key={l.id}
                      layer={l}
                      offsetY={canvasPaddingTop}
                    />
                  ))}
              </Layer>
            </Stage>
          )}

          {/* Empty state overlay (before any template is loaded) */}
          {!imageLayer && mounted && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white"
              style={{ height: canvasHeight }}
            >
              <p className="text-sm text-gray-400">Select a template or upload an image</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

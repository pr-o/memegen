'use client';

import { useEffect, useRef, useState, forwardRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore, type ImageLayer, type TextLayer } from '@/hooks/useEditorStore';

export const CANVAS_WIDTH = 600;

/** Loads a src string → HTMLImageElement; returns null while loading. */
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

// ─── Image node ───────────────────────────────────────────────────────────────

function CanvasImageNode({ layer }: { layer: ImageLayer }) {
  const img = useHTMLImage(layer.src);
  if (!img) return null;
  return (
    <KonvaImage
      image={img}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      opacity={layer.opacity}
      visible={layer.visible}
      draggable={false}
      listening={false}
    />
  );
}

// ─── Text node ────────────────────────────────────────────────────────────────

const CanvasTextNode = forwardRef<Konva.Text, {
  layer: TextLayer;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (x: number, y: number, width: number, height: number) => void;
}>(function CanvasTextNode({ layer, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) {
  const { style } = layer;
  const displayText = style.forceCapitalize ? style.text.toUpperCase() : style.text;

  return (
    <KonvaText
      ref={ref}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      text={displayText}
      fontSize={style.fontSize}
      fontFamily={style.fontFamily}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      shadowColor={style.shadowColor}
      shadowBlur={style.shadowColor !== 'transparent' ? 4 : 0}
      align={style.align}
      verticalAlign={style.verticalAlign}
      opacity={style.opacity}
      visible={layer.visible}
      wrap="word"
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={e => {
        onDragEnd(e.target.x(), e.target.y());
      }}
      onTransformEnd={e => {
        const node = e.target as Konva.Text;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onTransformEnd(
          node.x(),
          node.y(),
          Math.max(40, node.width() * scaleX),
          Math.max(20, node.height() * scaleY),
        );
      }}
    />
  );
});

// ─── CenterPane ───────────────────────────────────────────────────────────────

export default function CenterPane() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    layers,
    selectedLayerId,
    canvasPaddingTop,
    canvasPaddingBottom,
    selectLayer,
    updateLayer,
  } = useEditorStore();

  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Map<string, Konva.Text>>(new Map());

  const imageLayer = layers.find((l): l is ImageLayer => l.type === 'image');
  const textLayers = layers.filter((l): l is TextLayer => l.type === 'text');

  const canvasHeight =
    (imageLayer?.height ?? 400) + canvasPaddingTop + canvasPaddingBottom;

  // Attach Transformer to the selected Konva node
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (selectedLayerId) {
      const node = nodeRefs.current.get(selectedLayerId);
      if (node) {
        tr.nodes([node]);
      } else {
        tr.nodes([]);
      }
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedLayerId]);

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    // Deselect when clicking on the stage background or the white bg rect
    if (e.target === e.target.getStage() || e.target.name() === 'bg') {
      selectLayer(null);
    }
  }

  return (
    <main className="flex h-full flex-1 flex-col items-center overflow-y-auto bg-[#111]">
      {/* Toolbar placeholder — implemented in Step 11 */}
      <div className="flex w-full shrink-0 items-center gap-1 border-b border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2">
        <span className="text-xs text-muted-foreground">Toolbar</span>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 items-start justify-center py-8">
        <div className="relative shadow-2xl" style={{ width: CANVAS_WIDTH }}>
          {mounted && (
            <Stage
              width={CANVAS_WIDTH}
              height={canvasHeight}
              onClick={handleStageClick}
              onTap={handleStageClick}
            >
              <Layer>
                {/* White background */}
                <Rect
                  name="bg"
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={canvasHeight}
                  fill="#ffffff"
                />

                {/* Image layers (bottom) */}
                {layers
                  .filter((l): l is ImageLayer => l.type === 'image' && l.visible)
                  .map(l => <CanvasImageNode key={l.id} layer={l} />)}

                {/* Text layers (top) */}
                {textLayers
                  .filter(l => l.visible)
                  .map(l => (
                    <CanvasTextNode
                      key={l.id}
                      ref={node => {
                        if (node) nodeRefs.current.set(l.id, node);
                        else nodeRefs.current.delete(l.id);
                      }}
                      layer={l}
                      isSelected={selectedLayerId === l.id}
                      onSelect={() => selectLayer(l.id)}
                      onDragEnd={(x, y) => updateLayer(l.id, { x, y })}
                      onTransformEnd={(x, y, width, height) =>
                        updateLayer(l.id, { x, y, width, height })
                      }
                    />
                  ))}

                {/* Transformer for selected text layer */}
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={false}
                  anchorFill="#3b82f6"
                  anchorStroke="#1d4ed8"
                  anchorSize={8}
                  anchorCornerRadius={2}
                  borderStroke="#3b82f6"
                  borderStrokeWidth={1}
                  borderDash={[4, 2]}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 40 || newBox.height < 20) return oldBox;
                    return newBox;
                  }}
                />
              </Layer>
            </Stage>
          )}

          {/* Empty state */}
          {!imageLayer && mounted && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-white"
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

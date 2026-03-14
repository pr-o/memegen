'use client';

import { useEffect, useRef, useState, forwardRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore, type ImageLayer, type TextLayer } from '@/hooks/useEditorStore';
import { setStage } from '@/hooks/useStageRef';
import Toolbar from './Toolbar';
import CropOverlay from './CropOverlay';

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

const CanvasImageNode = forwardRef<Konva.Image, {
  layer: ImageLayer;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (x: number, y: number, width: number, height: number) => void;
}>(function CanvasImageNode(
  { layer, canvasWidth, canvasHeight, onSelect, onDragEnd, onTransformEnd },
  ref,
) {
  const img = useHTMLImage(layer.src);
  if (!img) return null;
  return (
    <KonvaImage
      ref={ref}
      image={img}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      opacity={layer.opacity}
      visible={layer.visible}
      draggable={!layer.locked}
      dragBoundFunc={pos => ({
        x: Math.max(-(layer.width - 20), Math.min(pos.x, canvasWidth - 20)),
        y: Math.max(-(layer.height - 20), Math.min(pos.y, canvasHeight - 20)),
      })}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={e => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={e => {
        const node = e.target as Konva.Image;
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

// ─── Text node ────────────────────────────────────────────────────────────────

const CanvasTextNode = forwardRef<Konva.Text, {
  layer: TextLayer;
  isEditing: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: () => void;
  onDblClick: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (x: number, y: number, width: number, height: number) => void;
}>(function CanvasTextNode(
  { layer, isEditing, canvasWidth, canvasHeight, onSelect, onDblClick, onDragEnd, onTransformEnd },
  ref,
) {
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
      // Hide while the textarea overlay is active
      visible={layer.visible && !isEditing}
      wrap="word"
      draggable={!layer.locked}
      // Keep at least 20px of the layer visible on each axis
      dragBoundFunc={pos => ({
        x: Math.max(-(layer.width - 20), Math.min(pos.x, canvasWidth - 20)),
        y: Math.max(-(layer.height - 20), Math.min(pos.y, canvasHeight - 20)),
      })}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      onDragEnd={e => onDragEnd(e.target.x(), e.target.y())}
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

// ─── Textarea overlay ─────────────────────────────────────────────────────────

function TextEditOverlay({
  layer,
  onCommit,
}: {
  layer: TextLayer;
  onCommit: (text: string) => void;
}) {
  const { style } = layer;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(style.text);

  // Focus + select all on mount
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  function commit() {
    onCommit(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') {
      commit();
    }
  }

  // CSS shadow approximation for stroke effect
  const shadowStyle =
    style.strokeWidth > 0
      ? {
          textShadow: [
            `-${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.stroke}`,
            ` ${style.strokeWidth}px -${style.strokeWidth}px 0 ${style.stroke}`,
            `-${style.strokeWidth}px  ${style.strokeWidth}px 0 ${style.stroke}`,
            ` ${style.strokeWidth}px  ${style.strokeWidth}px 0 ${style.stroke}`,
          ].join(','),
        }
      : {};

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        left: layer.x,
        top: layer.y,
        width: layer.width,
        minHeight: layer.height,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        color: style.fill,
        textAlign: style.align,
        opacity: style.opacity,
        background: 'transparent',
        border: '1px dashed #3b82f6',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        lineHeight: 1.2,
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        ...shadowStyle,
      }}
    />
  );
}

// ─── CenterPane ───────────────────────────────────────────────────────────────

export default function CenterPane() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ID of the layer currently being inline-edited
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  // Track Shift key for aspect-ratio-locked corner resize
  const [shiftHeld, setShiftHeld] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => setShiftHeld(e.shiftKey);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  const {
    layers,
    selectedLayerId,
    canvasPaddingTop,
    canvasPaddingBottom,
    canvasHeightOverride,
    cropMode,
    selectLayer,
    updateLayer,
    addPaddingTop,
    addPaddingBottom,
  } = useEditorStore();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Map<string, Konva.Node>>(new Map());

  // Register stage instance for export
  useEffect(() => {
    if (stageRef.current) setStage(stageRef.current);
    return () => setStage(null);
  }, [mounted]);

  const imageLayer = layers.find((l): l is ImageLayer => l.type === 'image');
  const textLayers = layers.filter((l): l is TextLayer => l.type === 'text');

  const canvasHeight = canvasHeightOverride
    ?? ((imageLayer?.height ?? 400) + canvasPaddingTop + canvasPaddingBottom);

  // Attach Transformer to the selected Konva node (skip while editing)
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (selectedLayerId && !editingLayerId) {
      const node = nodeRefs.current.get(selectedLayerId);
      tr.nodes(node ? [node] : []);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedLayerId, editingLayerId]);

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if (e.target === e.target.getStage() || e.target.name() === 'bg') {
      setEditingLayerId(null);
      selectLayer(null);
    }
  }

  function handleDblClick(layerId: string) {
    selectLayer(layerId);
    setEditingLayerId(layerId);
  }

  function commitEdit(layerId: string, text: string) {
    updateLayer(layerId, { style: { text } } as Parameters<typeof updateLayer>[1]);
    setEditingLayerId(null);
  }

  return (
    <main className="flex h-full flex-1 flex-col items-center overflow-y-auto bg-[#111]">
      <Toolbar />

      {/* Canvas area */}
      <div className="flex flex-1 items-start justify-center py-8">
        <div className="flex flex-col items-center gap-0">
          {/* + button above canvas */}
          <PaddingButton onClick={addPaddingTop} />

          {/* position:relative is the anchor for the textarea overlay */}
          <div className="relative shadow-2xl" style={{ width: CANVAS_WIDTH }}>
          {mounted && (
            <Stage
              ref={stageRef}
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
                  .map(l => (
                    <CanvasImageNode
                      key={l.id}
                      ref={node => {
                        if (node) nodeRefs.current.set(l.id, node);
                        else nodeRefs.current.delete(l.id);
                      }}
                      layer={l}
                      canvasWidth={CANVAS_WIDTH}
                      canvasHeight={canvasHeight}
                      onSelect={() => selectLayer(l.id)}
                      onDragEnd={(x, y) => updateLayer(l.id, { x, y })}
                      onTransformEnd={(x, y, width, height) =>
                        updateLayer(l.id, { x, y, width, height })
                      }
                    />
                  ))}

                {/* Text layers */}
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
                      isEditing={editingLayerId === l.id}
                      canvasWidth={CANVAS_WIDTH}
                      canvasHeight={canvasHeight}
                      onSelect={() => selectLayer(l.id)}
                      onDblClick={() => handleDblClick(l.id)}
                      onDragEnd={(x, y) => updateLayer(l.id, { x, y })}
                      onTransformEnd={(x, y, width, height) =>
                        updateLayer(l.id, { x, y, width, height })
                      }
                    />
                  ))}

                {/* Transformer */}
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={false}
                  keepRatio={shiftHeld}
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

          {/* Textarea overlay — rendered in DOM above the canvas */}
          {mounted && editingLayerId && (() => {
            const layer = textLayers.find(l => l.id === editingLayerId);
            if (!layer) return null;
            return (
              <TextEditOverlay
                key={editingLayerId}
                layer={layer}
                onCommit={text => commitEdit(editingLayerId, text)}
              />
            );
          })()}

          {/* Empty state */}
          {!imageLayer && mounted && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-white"
              style={{ height: canvasHeight }}
            >
              <p className="text-sm text-gray-400">Select a template or upload an image</p>
            </div>
          )}

          {/* Crop overlay */}
          {cropMode && mounted && (
            <CropOverlay canvasWidth={CANVAS_WIDTH} canvasHeight={canvasHeight} />
          )}
          </div>

          {/* + button below canvas */}
          <PaddingButton onClick={addPaddingBottom} />
        </div>
      </div>
    </main>
  );
}

// ─── Padding button ───────────────────────────────────────────────────────────

function PaddingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Add padding"
      style={{ width: CANVAS_WIDTH }}
      className="flex h-7 items-center justify-center bg-transparent text-muted-foreground transition-colors hover:bg-[#2a2a2a] hover:text-foreground"
    >
      <span className="text-lg leading-none">+</span>
    </button>
  );
}

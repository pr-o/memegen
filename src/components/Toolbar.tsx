'use client';

import { useRef } from 'react';
import { Type, ImagePlus, Undo2, Redo2, Crop } from 'lucide-react';
import {
  useEditorStore,
  nextLayerId,
  DEFAULT_TEXT_STYLE,
  type ImageLayer,
} from '@/hooks/useEditorStore';
import { CANVAS_WIDTH } from './CenterPane';

const TEXT_DEFAULT_W = 200;
const TEXT_DEFAULT_H = 80;

// ─── Toolbar ──────────────────────────────────────────────────────────────────

export default function Toolbar() {
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const {
    layers,
    canvasPaddingTop,
    canvasPaddingBottom,
    addLayer,
    undo,
    redo,
    historyIndex,
    history,
    setCropMode,
  } = useEditorStore();

  const imageLayer = layers.find(l => l.type === 'image');
  const canvasHeight =
    (imageLayer?.height ?? 400) + canvasPaddingTop + canvasPaddingBottom;

  function handleAddText() {
    const textCount = layers.filter(l => l.type === 'text').length;
    addLayer({
      id: nextLayerId(),
      type: 'text',
      name: `Text ${textCount + 1}`,
      visible: true,
      locked: false,
      x: CANVAS_WIDTH / 2 - TEXT_DEFAULT_W / 2,
      y: canvasHeight / 2 - TEXT_DEFAULT_H / 2,
      width: TEXT_DEFAULT_W,
      height: TEXT_DEFAULT_H,
      style: { ...DEFAULT_TEXT_STYLE, text: 'Text' },
    });
  }

  function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(CANVAS_WIDTH / img.naturalWidth, 1);
      const layer: ImageLayer = {
        id: nextLayerId(),
        type: 'image',
        name: file.name,
        visible: true,
        locked: false,
        src,
        x: 0,
        y: 0,
        width: img.naturalWidth * scale,
        height: img.naturalHeight * scale,
        opacity: 1,
      };
      addLayer(layer);
    };
    img.src = src;
    e.target.value = '';
  }

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <>
      <div className="flex w-full shrink-0 items-center gap-1 border-b border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5">
        <ToolbarButton onClick={handleAddText} title="Add Text">
          <Type className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton onClick={() => mediaInputRef.current?.click()} title="Add Media">
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-[#2a2a2a]" />

        <ToolbarButton onClick={undo} title="Undo" disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton onClick={redo} title="Redo" disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-[#2a2a2a]" />

        <ToolbarButton onClick={() => setCropMode(true)} title="Crop Canvas">
          <Crop className="h-4 w-4" />
        </ToolbarButton>

        <input
          ref={mediaInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={handleMediaUpload}
        />
      </div>

    </>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarButton({
  children,
  onClick,
  title,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[#2a2a2a] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

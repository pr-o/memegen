'use client';

import { useEffect, useRef, useState } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';
import {
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useEditorStore,
  type TextLayer,
  type ImageLayer,
  type TextStyleProps,
} from '@/hooks/useEditorStore';

// ─── Quick Style Presets ──────────────────────────────────────────────────────

const QUICK_STYLES: Record<string, Partial<TextStyleProps>> = {
  'Classic Meme':  { fontFamily: 'Impact',        fill: '#ffffff', stroke: '#000000', strokeWidth: 3, shadowColor: 'transparent', fontSize: 48 },
  'Bold Shadow':   { fontFamily: 'Impact',        fill: '#ffffff', stroke: '#000000', strokeWidth: 2, shadowColor: '#000000',     fontSize: 42 },
  'Neon Glow':     { fontFamily: 'Arial',         fill: '#00ffff', stroke: '#0055ff', strokeWidth: 2, shadowColor: '#00ffff',     fontSize: 36 },
  'Comic Style':   { fontFamily: 'Comic Sans MS', fill: '#ffff00', stroke: '#000000', strokeWidth: 2, shadowColor: 'transparent', fontSize: 32 },
  'Minimal':       { fontFamily: 'Arial',         fill: '#000000', stroke: 'transparent', strokeWidth: 0, shadowColor: 'transparent', fontSize: 28 },
  'Retro':         { fontFamily: 'Georgia',       fill: '#f5a623', stroke: '#7b3f00', strokeWidth: 1, shadowColor: '#7b3f00',     fontSize: 36 },
};

const FONTS = ['Impact', 'Arial', 'Comic Sans MS', 'Georgia', 'Courier New', 'Verdana'];

// ─── Color Swatch ─────────────────────────────────────────────────────────────

function ColorSwatch({
  color,
  onChange,
  label,
}: {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const isTransparent = color === 'transparent';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        title={label}
        className="flex h-7 w-7 items-center justify-center rounded border border-[#2a2a2a] hover:border-[#3b82f6] transition-colors"
        style={{
          background: isTransparent
            ? 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 0 0 / 8px 8px'
            : color,
        }}
      />
      {open && (
        <div className="absolute left-0 top-9 z-50">
          <SketchPicker
            color={isTransparent ? '#000000' : color}
            onChange={(c: ColorResult) => onChange(c.hex)}
            disableAlpha
          />
        </div>
      )}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

// ─── Alignment Toggles ────────────────────────────────────────────────────────

function AlignToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; icon: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-md border border-[#2a2a2a] overflow-hidden">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex flex-1 items-center justify-center py-1.5 transition-colors ${
            value === opt.value
              ? 'bg-[#3b82f6] text-white'
              : 'text-muted-foreground hover:bg-[#2a2a2a]'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

// ─── Text Properties ──────────────────────────────────────────────────────────

function TextProperties({ layer }: { layer: TextLayer }) {
  const { updateLayer } = useEditorStore();
  const { style } = layer;

  function patchStyle(patch: Partial<TextStyleProps>) {
    updateLayer(layer.id, { style: patch } as Parameters<typeof updateLayer>[1]);
  }

  return (
    <div className="flex flex-col gap-4 p-3">
      {/* Quick Styles */}
      <div>
        <SectionLabel>Quick Styles</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(QUICK_STYLES).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => patchStyle(preset)}
              className="rounded-md border border-[#2a2a2a] px-2 py-1.5 text-left text-[11px] text-foreground transition-colors hover:border-[#3b82f6] hover:bg-[#2a2a2a]"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div>
        <SectionLabel>Alignment</SectionLabel>
        <div className="flex flex-col gap-1.5">
          <AlignToggle
            value={style.align}
            onChange={v => patchStyle({ align: v })}
            options={[
              { value: 'left',   icon: <AlignLeft   className="h-3.5 w-3.5" /> },
              { value: 'center', icon: <AlignCenter  className="h-3.5 w-3.5" /> },
              { value: 'right',  icon: <AlignRight   className="h-3.5 w-3.5" /> },
            ]}
          />
          <AlignToggle
            value={style.verticalAlign}
            onChange={v => patchStyle({ verticalAlign: v })}
            options={[
              { value: 'top',    icon: <AlignStartVertical  className="h-3.5 w-3.5" /> },
              { value: 'middle', icon: <AlignCenterVertical className="h-3.5 w-3.5" /> },
              { value: 'bottom', icon: <AlignEndVertical    className="h-3.5 w-3.5" /> },
            ]}
          />
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <SectionLabel>Font Size</SectionLabel>
          <span className="text-[10px] text-muted-foreground">
            {style.autoSize ? 'auto' : `${style.fontSize}px`}
          </span>
        </div>
        <Slider
          min={8}
          max={120}
          step={1}
          value={[style.fontSize]}
          onValueChange={(val) => patchStyle({ fontSize: Array.isArray(val) ? (val as number[])[0] : Number(val) })}
          disabled={style.autoSize}
          className="mb-2"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Auto-size to fit</span>
          <Switch
            checked={style.autoSize}
            onCheckedChange={v => patchStyle({ autoSize: v })}
          />
        </div>
      </div>

      {/* Force Capitalize */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Force Capitalize</span>
        <Switch
          checked={style.forceCapitalize}
          onCheckedChange={v => patchStyle({ forceCapitalize: v })}
        />
      </div>

      {/* Font */}
      <div>
        <SectionLabel>Font</SectionLabel>
        <Select value={style.fontFamily} onValueChange={(v: string | null) => v && patchStyle({ fontFamily: v })}>
          <SelectTrigger className="h-8 border-[#2a2a2a] bg-[#111] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
            {FONTS.map(f => (
              <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Color */}
      <div>
        <SectionLabel>Text Color</SectionLabel>
        <ColorSwatch
          color={style.fill}
          label="Text color"
          onChange={hex => patchStyle({ fill: hex })}
        />
      </div>

      {/* Stroke */}
      <div>
        <SectionLabel>Stroke</SectionLabel>
        <div className="flex items-center gap-3">
          <ColorSwatch
            color={style.stroke}
            label="Stroke color"
            onChange={hex => patchStyle({ stroke: hex })}
          />
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-muted-foreground">Width</span>
              <span className="text-[10px] text-muted-foreground">{style.strokeWidth}px</span>
            </div>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[style.strokeWidth]}
              onValueChange={(val) => patchStyle({ strokeWidth: Array.isArray(val) ? (val as number[])[0] : Number(val) })}
            />
          </div>
        </div>
      </div>

      {/* Shadow */}
      <div>
        <SectionLabel>Shadow</SectionLabel>
        <ColorSwatch
          color={style.shadowColor}
          label="Shadow color"
          onChange={hex => patchStyle({ shadowColor: hex })}
        />
      </div>

      {/* Opacity */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <SectionLabel>Opacity</SectionLabel>
          <span className="text-[10px] text-muted-foreground">
            {Math.round(style.opacity * 100)}%
          </span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[style.opacity]}
          onValueChange={(val) => patchStyle({ opacity: Array.isArray(val) ? (val as number[])[0] : Number(val) })}
        />
      </div>
    </div>
  );
}

// ─── Image Properties ─────────────────────────────────────────────────────────

function ImageProperties({ layer }: { layer: ImageLayer }) {
  const { updateLayer } = useEditorStore();

  return (
    <div className="p-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <SectionLabel>Opacity</SectionLabel>
          <span className="text-[10px] text-muted-foreground">
            {Math.round(layer.opacity * 100)}%
          </span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[layer.opacity]}
          onValueChange={(val) => updateLayer(layer.id, { opacity: Array.isArray(val) ? (val as number[])[0] : Number(val) })}
        />
      </div>
    </div>
  );
}

// ─── PropertiesCard ───────────────────────────────────────────────────────────

export default function PropertiesCard() {
  const { layers, selectedLayerId } = useEditorStore();

  const selectedLayer = layers.find(l => l.id === selectedLayerId) ?? undefined;

  const isTextLayer = selectedLayer?.type === 'text';
  const isImageLayer = selectedLayer?.type === 'image';

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isTextLayer ? 'Text Properties' : isImageLayer ? 'Image Properties' : 'Properties'}
        </span>
      </div>

      {!selectedLayer && (
        <p className="p-3 text-xs text-muted-foreground">
          Select a layer to edit its properties.
        </p>
      )}

      {isTextLayer && <TextProperties layer={selectedLayer as TextLayer} />}
      {isImageLayer && <ImageProperties layer={selectedLayer as ImageLayer} />}
    </div>
  );
}

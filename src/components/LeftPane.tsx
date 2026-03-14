'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Search, Upload, Share2 } from 'lucide-react';
import { templates } from '@/data/templates';
import { useEditorStore, nextLayerId, type ImageLayer } from '@/hooks/useEditorStore';

const CANVAS_WIDTH = 600;

// Each thumbnail: (pane_content_width - gap) / 2 cols.
// Pane content = 192px - 2*12px padding = 168px. (168-8)/2 = 80px/thumbnail.
// 4 rows of 80px + 3×8px gap = 344px.
const GRID_HEIGHT = 344;

export default function LeftPane() {
  const [query, setQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedTemplate, loadTemplate, addLayer } = useEditorStore();

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
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

  return (
    <aside className="flex w-[192px] shrink-0 flex-col overflow-hidden rounded-xl bg-[#1a1a1a]">
      {/* Search + upload */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[#2a2a2a] p-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-7 w-full rounded-md border border-[#2a2a2a] bg-[#111] pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
          />
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload image"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Template grid — fixed height showing 2×4 thumbnails */}
      <div
        className="shrink-0 overflow-y-auto p-3"
        style={{ height: GRID_HEIGHT }}
      >
        {filtered.length === 0 ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">No templates found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(template => (
              <button
                key={template.id}
                onClick={() => loadTemplate(template, CANVAS_WIDTH)}
                className={`group relative overflow-hidden rounded-md border transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-[#3b82f6]'
                    : 'border-[#2a2a2a] hover:border-[#3b82f6]/60'
                }`}
              >
                <div className="relative aspect-square w-full bg-[#111]">
                  <Image
                    src={template.src}
                    alt={template.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Template info — flex-1 so it fills the remaining pane height */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto border-t border-[#2a2a2a] p-3">
        {selectedTemplate ? (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{selectedTemplate.name}</p>
              <button className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {selectedTemplate.description}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-muted-foreground">Select a template to see details.</p>
        )}
      </div>
    </aside>
  );
}

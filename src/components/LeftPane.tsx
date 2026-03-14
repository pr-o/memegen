'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Search, Upload, Share2 } from 'lucide-react';
import { templates } from '@/data/templates';
import { useEditorStore, nextLayerId, type ImageLayer } from '@/hooks/useEditorStore';

const CANVAS_WIDTH = 600;

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
    // reset so same file can be re-uploaded
    e.target.value = '';
  }

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-[#2a2a2a] bg-[#1a1a1a]">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[#2a2a2a] p-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-8 w-full rounded-md border border-[#2a2a2a] bg-[#111] pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
          />
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-8 shrink-0 items-center gap-1 rounded-md bg-[#3b82f6] px-3 text-xs font-medium text-white hover:bg-[#2563eb] transition-colors"
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-y-auto p-3">
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
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
                <p className="truncate bg-[#111] px-1.5 py-1 text-left text-[10px] text-muted-foreground">
                  {template.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Template info */}
      {selectedTemplate && (
        <div className="shrink-0 border-t border-[#2a2a2a] p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{selectedTemplate.name}</p>
            <button className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {selectedTemplate.description}
          </p>
        </div>
      )}
    </aside>
  );
}

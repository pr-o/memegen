"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { templates } from "@/data/templates";
import {
  useEditorStore,
  nextLayerId,
  type ImageLayer,
} from "@/hooks/useEditorStore";

const CANVAS_WIDTH = 600;

export default function LeftPane() {
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { selectedTemplate, addLayer } = useEditorStore();

  const [shuffled] = useState(() => [...templates].sort(() => Math.random() - 0.5));

  const filtered = shuffled.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()),
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
        type: "image",
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
    e.target.value = "";
  }

  return (
    <>
      {/* Card 1: search + template grid */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-[#1a1a1a]">
        {/* Search + upload */}
        <div className="flex shrink-0 items-center gap-2 border-b border-[#2a2a2a] p-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 border-[#2a2a2a] bg-[#111] pl-8 pr-2 text-sm placeholder:text-muted-foreground focus-visible:ring-[#3b82f6]"
            />
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            title="Upload image"
            className="shrink-0 bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Template grid — scrollable, sized to show 2×4 thumbnails */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-3">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No templates found.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => router.push(`/create/${template.id}`)}
                    className={`group relative overflow-hidden rounded-md border transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "border-[#3b82f6]"
                        : "border-[#2a2a2a] hover:border-[#3b82f6]/60"
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
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Card 2: template info — flex-1 fills remaining column height */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-[#1a1a1a]">
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-3">
            {selectedTemplate ? (
              <>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-xl font-semibold text-foreground">
                    {selectedTemplate.name}
                  </p>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a template to see details.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

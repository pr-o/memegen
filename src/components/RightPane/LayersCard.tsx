'use client';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, ImageIcon, Lock, LockOpen, Trash2, Type } from 'lucide-react';
import { useEditorStore, type Layer, type ImageLayer } from '@/hooks/useEditorStore';

// ─── Sortable row ─────────────────────────────────────────────────────────────

function LayerRow({ layer }: { layer: Layer }) {
  const { selectedLayerId, selectLayer, updateLayer, removeLayer } = useEditorStore();

  const isSelected = selectedLayerId === layer.id;
  const isImage = layer.type === 'image';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={rowStyle}
      onClick={() => selectLayer(layer.id)}
      className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
        isSelected ? 'bg-[#2d4a7a]' : 'hover:bg-[#2a2a2a]'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        style={{ opacity: isImage ? 0.3 : 1 }}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Icon + name */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={(layer as ImageLayer).src}
            alt=""
            className="h-5 w-5 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <Type className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-xs text-foreground">{layer.name}</span>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5" onClick={e => e.stopPropagation()}>
        {/* Visibility toggle */}
        <button
          onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          title={layer.visible ? 'Hide layer' : 'Show layer'}
        >
          {layer.visible
            ? <Eye className="h-3.5 w-3.5" />
            : <EyeOff className="h-3.5 w-3.5" />}
        </button>

        {/* Lock toggle */}
        <button
          onClick={() => updateLayer(layer.id, { locked: !layer.locked })}
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          title={layer.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {layer.locked
            ? <Lock className="h-3.5 w-3.5" />
            : <LockOpen className="h-3.5 w-3.5" />}
        </button>

        {/* Delete (hidden for locked layers) */}
        {!layer.locked && (
          <button
            onClick={() => removeLayer(layer.id)}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-red-500"
            title="Delete layer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── LayersCard ───────────────────────────────────────────────────────────────

export default function LayersCard() {
  const { layers, reorderLayers } = useEditorStore();

  // Display order: topmost layer at top of list (reverse of store order)
  const displayLayers = [...layers].reverse();

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromDisplay = displayLayers.findIndex(l => l.id === active.id);
    const toDisplay = displayLayers.findIndex(l => l.id === over.id);

    // Convert display indices back to store indices
    const fromStore = layers.length - 1 - fromDisplay;
    const toStore = layers.length - 1 - toDisplay;

    reorderLayers(fromStore, toStore);
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-3 py-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Layers
        </span>
      </div>

      {/* Layer list */}
      <div className="p-2">
        {layers.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No layers yet. Add text or media to get started.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayLayers.map(l => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {displayLayers.map(layer => (
                <LayerRow key={layer.id} layer={layer} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

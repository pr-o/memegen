import { create } from 'zustand';
import { MemeTemplate } from '@/data/templates';

// ─── Layer Types ────────────────────────────────────────────────────────────

export interface TextStyleProps {
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  shadowColor: string;
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  opacity: number;         // 0–1
  forceCapitalize: boolean;
  autoSize: boolean;
}

export interface BaseLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  style: TextStyleProps;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  opacity: number;         // 0–1
}

export type Layer = TextLayer | ImageLayer;

// ─── Default Style ───────────────────────────────────────────────────────────

export const DEFAULT_TEXT_STYLE: TextStyleProps = {
  text: 'Text',
  fontSize: 36,
  fontFamily: 'Impact',
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 2,
  shadowColor: '#000000',
  align: 'center',
  verticalAlign: 'middle',
  opacity: 1,
  forceCapitalize: false,
  autoSize: false,
};

// ─── Store State & Actions ───────────────────────────────────────────────────

const MAX_HISTORY = 50;

interface EditorState {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedTemplate: MemeTemplate | null;
  canvasPaddingTop: number;
  canvasPaddingBottom: number;
  history: Layer[][];
  historyIndex: number;

  // Layer actions
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, patch: Partial<Omit<TextLayer, 'id' | 'type'>> | Partial<Omit<ImageLayer, 'id' | 'type'>>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  selectLayer: (id: string | null) => void;

  // Template
  loadTemplate: (template: MemeTemplate, canvasWidth: number) => void;

  // Canvas padding
  addPaddingTop: () => void;
  addPaddingBottom: () => void;

  // Undo / redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _layerCounter = 1;
export const nextLayerId = () => `layer-${Date.now()}-${_layerCounter++}`;

function cloneLayers(layers: Layer[]): Layer[] {
  return layers.map(l => ({ ...l, ...(l.type === 'text' ? { style: { ...l.style } } : {}) }));
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>((set, get) => ({
  layers: [],
  selectedLayerId: null,
  selectedTemplate: null,
  canvasPaddingTop: 0,
  canvasPaddingBottom: 0,
  history: [],
  historyIndex: -1,

  // ── Layer actions ──────────────────────────────────────────────────────────

  addLayer: (layer) => {
    get().pushHistory();
    set(s => ({ layers: [...s.layers, layer] }));
  },

  updateLayer: (id, patch) => {
    get().pushHistory();
    set(s => ({
      layers: s.layers.map(l => {
        if (l.id !== id) return l;
        // style patch is nested for text layers
        if (l.type === 'text' && 'style' in patch) {
          return { ...l, ...patch, style: { ...l.style, ...(patch as Partial<TextLayer>).style } };
        }
        return { ...l, ...patch };
      }),
    }));
  },

  removeLayer: (id) => {
    get().pushHistory();
    set(s => ({
      layers: s.layers.filter(l => l.id !== id),
      selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
    }));
  },

  reorderLayers: (fromIndex, toIndex) => {
    get().pushHistory();
    set(s => {
      const next = [...s.layers];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { layers: next };
    });
  },

  selectLayer: (id) => set({ selectedLayerId: id }),

  // ── Template ───────────────────────────────────────────────────────────────

  loadTemplate: (template, canvasWidth) => {
    const scale = canvasWidth / template.width;
    const canvasHeight = template.height * scale;

    const imageLayer: ImageLayer = {
      id: nextLayerId(),
      type: 'image',
      name: 'Image',
      visible: true,
      locked: true,
      src: template.src,
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      opacity: 1,
    };

    const textLayers: TextLayer[] = template.textLayers.map((def, i) => ({
      id: nextLayerId(),
      type: 'text',
      name: def.label || `Text ${i + 1}`,
      visible: true,
      locked: false,
      x: def.x * canvasWidth,
      y: def.y * canvasHeight,
      width: def.w * canvasWidth,
      height: def.h * canvasHeight,
      style: {
        ...DEFAULT_TEXT_STYLE,
        ...def.style,
        text: def.defaultText,
      },
    }));

    set({
      layers: [imageLayer, ...textLayers],
      selectedLayerId: null,
      selectedTemplate: template,
      canvasPaddingTop: 0,
      canvasPaddingBottom: 0,
      history: [],
      historyIndex: -1,
    });
  },

  // ── Canvas padding ─────────────────────────────────────────────────────────

  addPaddingTop: () => set(s => ({ canvasPaddingTop: s.canvasPaddingTop + 80 })),
  addPaddingBottom: () => set(s => ({ canvasPaddingBottom: s.canvasPaddingBottom + 80 })),

  // ── Undo / Redo ────────────────────────────────────────────────────────────

  pushHistory: () => {
    const { layers, history, historyIndex } = get();
    const snapshot = cloneLayers(layers);
    // Discard any redo history ahead of current index
    const trimmed = history.slice(0, historyIndex + 1);
    const next = [...trimmed, snapshot].slice(-MAX_HISTORY);
    set({ history: next, historyIndex: next.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ layers: cloneLayers(history[newIndex]), historyIndex: newIndex });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ layers: cloneLayers(history[newIndex]), historyIndex: newIndex });
  },
}));

import { useEditorStore } from '@/hooks/useEditorStore';
import type { TextLayer, ImageLayer } from '@/hooks/useEditorStore';

function makeTextLayer(overrides?: Partial<TextLayer>): TextLayer {
  return {
    id: 'test-1',
    type: 'text',
    name: 'Test Text',
    visible: true,
    locked: false,
    x: 10,
    y: 10,
    width: 200,
    height: 50,
    style: {
      text: 'Hello',
      fontSize: 36,
      fontFamily: 'Impact',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      shadowColor: 'transparent',
      align: 'center',
      verticalAlign: 'middle',
      opacity: 1,
      forceCapitalize: false,
      autoSize: false,
    },
    ...overrides,
  };
}

function makeImageLayer(overrides?: Partial<ImageLayer>): ImageLayer {
  return {
    id: 'img-1',
    type: 'image',
    name: 'Image',
    visible: true,
    locked: true,
    x: 0,
    y: 0,
    width: 600,
    height: 400,
    src: '/test.jpg',
    opacity: 1,
    ...overrides,
  };
}

beforeEach(() => {
  useEditorStore.setState({
    layers: [],
    selectedLayerId: null,
    history: [],
    historyIndex: -1,
  });
});

describe('useEditorStore', () => {
  describe('addLayer', () => {
    it('adds a layer to the store', () => {
      const layer = makeTextLayer();
      useEditorStore.getState().addLayer(layer);
      expect(useEditorStore.getState().layers).toHaveLength(1);
      expect(useEditorStore.getState().layers[0].id).toBe('test-1');
    });

    it('appends layers in order', () => {
      useEditorStore.getState().addLayer(makeTextLayer({ id: 'a' }));
      useEditorStore.getState().addLayer(makeImageLayer({ id: 'b' }));
      const ids = useEditorStore.getState().layers.map((l) => l.id);
      expect(ids).toEqual(['a', 'b']);
    });
  });

  describe('removeLayer', () => {
    it('removes the layer by id', () => {
      useEditorStore.getState().addLayer(makeTextLayer({ id: 'del-me' }));
      useEditorStore.getState().removeLayer('del-me');
      expect(useEditorStore.getState().layers).toHaveLength(0);
    });

    it('clears selectedLayerId when the selected layer is removed', () => {
      useEditorStore.getState().addLayer(makeTextLayer({ id: 'sel' }));
      useEditorStore.setState({ selectedLayerId: 'sel' });
      useEditorStore.getState().removeLayer('sel');
      expect(useEditorStore.getState().selectedLayerId).toBeNull();
    });
  });

  describe('updateLayer', () => {
    it('updates top-level fields on a layer', () => {
      useEditorStore.getState().addLayer(makeTextLayer({ id: 'upd' }));
      useEditorStore.getState().updateLayer('upd', { x: 99 });
      const layer = useEditorStore.getState().layers[0];
      expect(layer.x).toBe(99);
    });

    it('merges nested style for text layers', () => {
      useEditorStore.getState().addLayer(makeTextLayer({ id: 'txt' }));
      useEditorStore.getState().updateLayer('txt', { style: { fontSize: 72 } } as Partial<TextLayer>);
      const layer = useEditorStore.getState().layers[0] as TextLayer;
      expect(layer.style.fontSize).toBe(72);
      expect(layer.style.fill).toBe('#ffffff'); // unchanged
    });
  });

  describe('reorderLayers', () => {
    it('moves a layer from one index to another', () => {
      useEditorStore.getState().addLayer(makeTextLayer({ id: 'a' }));
      useEditorStore.getState().addLayer(makeTextLayer({ id: 'b' }));
      useEditorStore.getState().addLayer(makeTextLayer({ id: 'c' }));
      useEditorStore.getState().reorderLayers(0, 2);
      const ids = useEditorStore.getState().layers.map((l) => l.id);
      expect(ids).toEqual(['b', 'c', 'a']);
    });
  });

  describe('selectLayer', () => {
    it('sets selectedLayerId', () => {
      useEditorStore.getState().selectLayer('foo');
      expect(useEditorStore.getState().selectedLayerId).toBe('foo');
    });

    it('can deselect by passing null', () => {
      useEditorStore.getState().selectLayer('foo');
      useEditorStore.getState().selectLayer(null);
      expect(useEditorStore.getState().selectedLayerId).toBeNull();
    });
  });
});

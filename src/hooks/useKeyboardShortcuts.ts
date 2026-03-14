'use client';

import { useEffect } from 'react';
import { useEditorStore } from './useEditorStore';

export function useKeyboardShortcuts() {
  const { undo, redo, removeLayer, selectedLayerId, layers } = useEditorStore();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      // Don't fire shortcuts while typing in inputs or textareas
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
        const layer = layers.find(l => l.id === selectedLayerId);
        if (layer && !layer.locked) {
          e.preventDefault();
          removeLayer(selectedLayerId);
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, removeLayer, selectedLayerId, layers]);
}

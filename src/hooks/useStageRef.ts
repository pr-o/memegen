/**
 * Module-level singleton ref to the Konva Stage instance.
 * CenterPane sets it on mount; any component can call getStage() to export.
 */
import type Konva from 'konva';

let _stage: Konva.Stage | null = null;

export function setStage(stage: Konva.Stage | null) {
  _stage = stage;
}

export function getStage(): Konva.Stage | null {
  return _stage;
}

/** Flatten the canvas to a PNG and trigger a browser download. */
export function exportAsPng(filename = 'meme.png') {
  const stage = _stage;
  if (!stage) return;

  // Temporarily hide Transformer nodes so they don't appear in the export
  const transformers = stage.find('Transformer');
  transformers.forEach(node => node.hide());
  stage.batchDraw();

  const dataURL = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });

  // Restore Transformer visibility
  transformers.forEach(node => node.show());
  stage.batchDraw();

  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

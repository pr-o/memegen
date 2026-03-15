/**
 * Module-level singleton ref to the Konva Stage instance.
 * CenterPane sets it on mount; any component can call getStage() to export.
 */
import type Konva from 'konva';

const MAX_BYTES = 300 * 1024; // 300 KB

let _stage: Konva.Stage | null = null;

export function setStage(stage: Konva.Stage | null) {
  _stage = stage;
}

export function getStage(): Konva.Stage | null {
  return _stage;
}

/**
 * Return the canvas as a JPEG data URL compressed to stay under 300 KB.
 * Starts at quality 0.9 and steps down by 0.1 until the size fits.
 */
export function getCanvasDataUrl(): string | null {
  const stage = _stage;
  if (!stage) return null;

  const transformers = stage.find('Transformer');
  transformers.forEach(node => node.hide());
  stage.batchDraw();

  let dataURL = '';
  let quality = 0.9;

  do {
    dataURL = stage.toDataURL({ pixelRatio: 1.5, mimeType: 'image/jpeg', quality });
    const bytes = Math.ceil(
      (dataURL.length - 'data:image/jpeg;base64,'.length) * 3 / 4
    );
    if (bytes <= MAX_BYTES || quality <= 0.1) break;
    quality = Math.round((quality - 0.1) * 10) / 10;
  } while (true);

  transformers.forEach(node => node.show());
  stage.batchDraw();

  return dataURL;
}

/** Flatten the canvas to a JPEG and trigger a browser download. */
export function exportAsPng(filename = 'meme.jpg') {
  const dataURL = getCanvasDataUrl();
  if (!dataURL) return;

  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

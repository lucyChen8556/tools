import { imageMaskZoomConfig, type DrawingState, type ImageMask, type MaskImage, type Point, type ResizeHandle } from './constants';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampZoom(value: number) {
  return clamp(Number(value.toFixed(2)), imageMaskZoomConfig.min, imageMaskZoomConfig.max);
}

function normalizeRect(rect: DrawingState) {
  const x = Math.min(rect.startX, rect.currentX);
  const y = Math.min(rect.startY, rect.currentY);
  const w = Math.abs(rect.currentX - rect.startX);
  const h = Math.abs(rect.currentY - rect.startY);
  return { x, y, w, h };
}

function toPixels(mask: Pick<ImageMask, 'x' | 'y' | 'w' | 'h'>, width: number, height: number) {
  return {
    x: Math.round(mask.x * width),
    y: Math.round(mask.y * height),
    w: Math.round(mask.w * width),
    h: Math.round(mask.h * height),
  };
}

function buildExportName(fileName: string) {
  const cleanName = fileName.replace(/\.[^.]+$/, '');
  return `${cleanName || 'image'}-masked.png`;
}

function loadImageFile(file: File) {
  return new Promise<MaskImage>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        url,
        img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        masks: [],
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read image: ${file.name}`));
    };

    img.src = url;
  });
}

function pixelate(targetCtx: CanvasRenderingContext2D, rect: ReturnType<typeof toPixels>, blockSize: number) {
  const { x, y, w, h } = rect;
  const sampleWidth = Math.max(1, Math.ceil(w / blockSize));
  const sampleHeight = Math.max(1, Math.ceil(h / blockSize));
  const temp = document.createElement('canvas');
  temp.width = sampleWidth;
  temp.height = sampleHeight;
  const tempCtx = temp.getContext('2d');
  if (!tempCtx) return;

  tempCtx.imageSmoothingEnabled = true;
  tempCtx.drawImage(targetCtx.canvas, x, y, w, h, 0, 0, sampleWidth, sampleHeight);

  targetCtx.save();
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(temp, 0, 0, sampleWidth, sampleHeight, x, y, w, h);
  targetCtx.restore();
}

function drawMask(targetCtx: CanvasRenderingContext2D, mask: ImageMask, width: number, height: number) {
  const rect = toPixels(mask, width, height);
  if (mask.mode === 'bar') {
    targetCtx.fillStyle = '#060706';
    targetCtx.fillRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }

  if (mask.mode === 'blur') {
    targetCtx.save();
    targetCtx.filter = `blur(${Math.max(4, mask.strength / 2)}px)`;
    targetCtx.drawImage(targetCtx.canvas, rect.x, rect.y, rect.w, rect.h, rect.x, rect.y, rect.w, rect.h);
    targetCtx.restore();
    return;
  }

  pixelate(targetCtx, rect, Math.max(4, mask.strength));
}

function getHandleRects(mask: ImageMask, width: number, height: number) {
  const rect = toPixels(mask, width, height);
  const size = 12;
  const half = size / 2;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const right = rect.x + rect.w;
  const bottom = rect.y + rect.h;

  return [
    { name: 'nw', x: rect.x - half, y: rect.y - half, size },
    { name: 'n', x: cx - half, y: rect.y - half, size },
    { name: 'ne', x: right - half, y: rect.y - half, size },
    { name: 'e', x: right - half, y: cy - half, size },
    { name: 'se', x: right - half, y: bottom - half, size },
    { name: 's', x: cx - half, y: bottom - half, size },
    { name: 'sw', x: rect.x - half, y: bottom - half, size },
    { name: 'w', x: rect.x - half, y: cy - half, size },
  ] as Array<{ name: ResizeHandle; x: number; y: number; size: number }>;
}

function drawSelection(ctx: CanvasRenderingContext2D, rect: Pick<ImageMask, 'x' | 'y' | 'w' | 'h'>) {
  const pixels = toPixels(rect, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.fillStyle = 'rgba(13, 127, 118, 0.16)';
  ctx.strokeStyle = '#0d7f76';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 5]);
  ctx.fillRect(pixels.x, pixels.y, pixels.w, pixels.h);
  ctx.strokeRect(pixels.x, pixels.y, pixels.w, pixels.h);
  ctx.restore();
}

function drawMaskEditor(ctx: CanvasRenderingContext2D, mask: ImageMask) {
  const rect = toPixels(mask, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.strokeStyle = '#0d7f76';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.strokeRect(rect.x + 1, rect.y + 1, Math.max(0, rect.w - 2), Math.max(0, rect.h - 2));
  ctx.setLineDash([]);

  getHandleRects(mask, ctx.canvas.width, ctx.canvas.height).forEach((handle) => {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0d7f76';
    ctx.lineWidth = 2;
    ctx.fillRect(handle.x, handle.y, handle.size, handle.size);
    ctx.strokeRect(handle.x, handle.y, handle.size, handle.size);
  });
  ctx.restore();
}

function moveMask(mask: ImageMask, startPoint: Point, point: Point) {
  const dx = point.x - startPoint.x;
  const dy = point.y - startPoint.y;
  return {
    ...mask,
    x: clamp(mask.x + dx, 0, 1 - mask.w),
    y: clamp(mask.y + dy, 0, 1 - mask.h),
  };
}

function resizeMask(mask: ImageMask, handle: ResizeHandle, point: Point) {
  const minSize = 0.006;
  let left = mask.x;
  let top = mask.y;
  let right = mask.x + mask.w;
  let bottom = mask.y + mask.h;

  if (handle.includes('w')) left = clamp(point.x, 0, right - minSize);
  if (handle.includes('e')) right = clamp(point.x, left + minSize, 1);
  if (handle.includes('n')) top = clamp(point.y, 0, bottom - minSize);
  if (handle.includes('s')) bottom = clamp(point.y, top + minSize, 1);

  return {
    ...mask,
    x: left,
    y: top,
    w: right - left,
    h: bottom - top,
  };
}

function exportMaskedImage(image: MaskImage) {
  const output = document.createElement('canvas');
  output.width = image.width;
  output.height = image.height;
  const outputCtx = output.getContext('2d');
  if (!outputCtx) return;

  outputCtx.drawImage(image.img, 0, 0, image.width, image.height);
  image.masks.forEach((mask) => drawMask(outputCtx, mask, image.width, image.height));
  output.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement('a');
    const exportUrl = URL.createObjectURL(blob);
    link.href = exportUrl;
    link.download = buildExportName(image.name);
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(exportUrl), 1000);
  }, 'image/png');
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export {
  clamp,
  clampZoom,
  drawMask,
  drawMaskEditor,
  drawSelection,
  exportMaskedImage,
  formatPercent,
  getHandleRects,
  loadImageFile,
  moveMask,
  normalizeRect,
  resizeMask,
  toPixels,
};

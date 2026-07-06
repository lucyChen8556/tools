import { useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent, PointerEvent, WheelEvent } from 'react';
import { Download, ImagePlus, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { Field } from '../../components/Field';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { ActionBar, MetricsGrid } from '../../components/ToolLayout';
import { ToolbarButton } from '../../components/ToolbarButton';
import {
  imageMaskModeOptions,
  imageMaskZoomConfig,
  type DrawingState,
  type ImageMask,
  type ImageMaskMode,
  type InteractionState,
  type MaskImage,
  type Point,
  type ResizeHandle,
} from './constants';

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

function ImageMaskPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<MaskImage[]>([]);
  const interactionRef = useRef<InteractionState | null>(null);
  const [images, setImages] = useState<MaskImage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<ImageMaskMode>('pixelate');
  const [strength, setStrength] = useState(14);
  const [zoom, setZoom] = useState(1);
  const [selectedMaskIndex, setSelectedMaskIndex] = useState<number | null>(null);
  const [drawing, setDrawing] = useState<DrawingState | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const activeImage = useMemo(() => images.find((image) => image.id === activeId) ?? null, [activeId, images]);
  const selectedMask = activeImage && selectedMaskIndex !== null ? activeImage.masks[selectedMaskIndex] : null;
  const totalMasks = images.reduce((sum, image) => sum + image.masks.length, 0);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    },
    [],
  );

  useEffect(() => {
    renderCanvas();
  });

  useEffect(() => {
    function handleResize() {
      renderCanvas();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function updateActiveImageMasks(updater: (masks: ImageMask[]) => ImageMask[]) {
    setImages((current) =>
      current.map((image) => (image.id === activeId ? { ...image, masks: updater(image.masks.map((mask) => ({ ...mask }))) } : image)),
    );
  }

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;

    const loaded = await Promise.all(files.map(loadImageFile));
    setImages((current) => [...current, ...loaded]);
    setActiveId((current) => current ?? loaded[0]?.id ?? null);
    setSelectedMaskIndex(null);
  }

  function handleModeChange(nextMode: ImageMaskMode) {
    setMode(nextMode);
    if (selectedMaskIndex === null) return;
    updateActiveImageMasks((masks) => masks.map((mask, index) => (index === selectedMaskIndex ? { ...mask, mode: nextMode } : mask)));
  }

  function handleStrengthChange(value: number) {
    setStrength(value);
    if (selectedMaskIndex === null) return;
    updateActiveImageMasks((masks) => masks.map((mask, index) => (index === selectedMaskIndex ? { ...mask, strength: value } : mask)));
  }

  function selectImage(image: MaskImage) {
    setActiveId(image.id);
    setSelectedMaskIndex(image.masks.length ? 0 : null);
    if (image.masks[0]) {
      setMode(image.masks[0].mode);
      setStrength(image.masks[0].strength);
    }
  }

  function undoMask() {
    interactionRef.current = null;
    setDrawing(null);
    updateActiveImageMasks((masks) => masks.slice(0, -1));
    setSelectedMaskIndex((current) => {
      const nextLength = Math.max((activeImage?.masks.length ?? 1) - 1, 0);
      if (!nextLength) return null;
      if (current === null) return nextLength - 1;
      return Math.min(current, nextLength - 1);
    });
  }

  function clearMasks() {
    interactionRef.current = null;
    setDrawing(null);
    updateActiveImageMasks(() => []);
    setSelectedMaskIndex(null);
  }

  function resetImages() {
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    imagesRef.current = [];
    interactionRef.current = null;
    setImages([]);
    setActiveId(null);
    setMode('pixelate');
    setStrength(14);
    setSelectedMaskIndex(null);
    setDrawing(null);
    setZoom(1);
  }

  function applyMasksToAll() {
    if (!activeImage?.masks.length) return;
    const copiedMasks = activeImage.masks.map((mask) => ({ ...mask }));
    setImages((current) =>
      current.map((image) => (image.id === activeImage.id ? image : { ...image, masks: copiedMasks.map((mask) => ({ ...mask })) })),
    );
  }

  function fitCanvasToShell(image: MaskImage) {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;

    const shellRect = shell.getBoundingClientRect();
    const maxWidth = Math.max(shellRect.width - 32, 240);
    const maxHeight = Math.max(shellRect.height - 32, 240);
    const fitScale = Math.min(maxWidth / image.width, maxHeight / image.height);
    const scale = fitScale * zoom;
    const displayWidth = Math.max(1, Math.round(image.width * scale));
    const displayHeight = Math.max(1, Math.round(image.height * scale));

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.width = displayWidth;
    canvas.height = displayHeight;
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

  function renderCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!activeImage) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    fitCanvasToShell(activeImage);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(activeImage.img, 0, 0, canvas.width, canvas.height);
    activeImage.masks.forEach((mask) => drawMask(ctx, mask, canvas.width, canvas.height));

    if (selectedMask) drawMaskEditor(ctx, selectedMask);
    if (drawing) drawSelection(ctx, normalizeRect(drawing));
  }

  function pointerToNormalizedPoint(event: PointerEvent<HTMLCanvasElement> | WheelEvent<HTMLDivElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
    };
  }

  function hitTestHandles(point: Point, mask: ImageMask) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const pixelPoint = {
      x: point.x * canvas.width,
      y: point.y * canvas.height,
    };
    const hit = getHandleRects(mask, canvas.width, canvas.height).find(
      (handle) =>
        pixelPoint.x >= handle.x &&
        pixelPoint.x <= handle.x + handle.size &&
        pixelPoint.y >= handle.y &&
        pixelPoint.y <= handle.y + handle.size,
    );
    return hit?.name ?? null;
  }

  function hitTestMasks(point: Point) {
    if (!activeImage) return null;

    if (selectedMaskIndex !== null) {
      const mask = activeImage.masks[selectedMaskIndex];
      const handle = mask ? hitTestHandles(point, mask) : null;
      if (handle) return { index: selectedMaskIndex, handle };
    }

    for (let index = activeImage.masks.length - 1; index >= 0; index -= 1) {
      const mask = activeImage.masks[index];
      const handle = hitTestHandles(point, mask);
      if (handle) return { index, handle };
      if (point.x >= mask.x && point.x <= mask.x + mask.w && point.y >= mask.y && point.y <= mask.y + mask.h) {
        return { index, handle: null };
      }
    }

    return null;
  }

  function updateCanvasCursor(point: Point) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTestMasks(point);
    if (!hit) {
      canvas.style.cursor = 'crosshair';
      return;
    }

    const cursorByHandle: Record<ResizeHandle, string> = {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize',
      ne: 'nesw-resize',
      sw: 'nesw-resize',
    };
    canvas.style.cursor = hit.handle ? cursorByHandle[hit.handle] : 'move';
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!activeImage) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointerToNormalizedPoint(event);
    const hit = hitTestMasks(point);

    if (hit) {
      const mask = activeImage.masks[hit.index];
      setSelectedMaskIndex(hit.index);
      setMode(mask.mode);
      setStrength(mask.strength);
      interactionRef.current = {
        type: hit.handle ? 'resize' : 'move',
        handle: hit.handle,
        maskIndex: hit.index,
        startPoint: point,
        originalMask: { ...mask },
      };
      return;
    }

    setSelectedMaskIndex(null);
    setDrawing({ startX: point.x, startY: point.y, currentX: point.x, currentY: point.y });
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const point = pointerToNormalizedPoint(event);
    const interaction = interactionRef.current;

    if (interaction) {
      updateActiveImageMasks((masks) =>
        masks.map((mask, index) => {
          if (index !== interaction.maskIndex) return mask;
          if (interaction.type === 'move') return moveMask(interaction.originalMask, interaction.startPoint, point);
          if (!interaction.handle) return mask;
          return resizeMask(interaction.originalMask, interaction.handle, point);
        }),
      );
      return;
    }

    if (!drawing) {
      updateCanvasCursor(point);
      return;
    }

    setDrawing((current) => (current ? { ...current, currentX: point.x, currentY: point.y } : current));
  }

  function finishDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const interaction = interactionRef.current;
    if (interaction) {
      interactionRef.current = null;
      return;
    }

    if (!drawing) return;
    const point = pointerToNormalizedPoint(event);
    const rect = normalizeRect({ ...drawing, currentX: point.x, currentY: point.y });
    setDrawing(null);

    if (rect.w <= 0.006 || rect.h <= 0.006) return;

    updateActiveImageMasks((masks) => [...masks, { ...rect, mode, strength }]);
    setSelectedMaskIndex(activeImage?.masks.length ?? 0);
  }

  function exportImage(image: MaskImage) {
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

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!activeImage) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoom((current) => clampZoom(current + direction * imageMaskZoomConfig.step));
  }

  return (
    <>
      <div
        className={`image-mask-upload ${isDraggingOver ? 'dragging' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDraggingOver(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <ImagePlus size={22} />
          <span>Drop images here or click to upload</span>
        </label>
      </div>

      <div className="image-mask-layout">
        <aside className="image-mask-list" aria-label="Uploaded images">
          <div className="image-mask-list-header">
            <span>{images.length} images</span>
          </div>
          {images.length === 0 ? (
            <div className="empty-state compact">No images uploaded</div>
          ) : (
            images.map((image) => (
              <button className={`image-mask-item ${image.id === activeId ? 'active' : ''}`} key={image.id} type="button" onClick={() => selectImage(image)}>
                <img src={image.url} alt="" />
                <span>
                  <strong>{image.name}</strong>
                  <small>{`${image.width} x ${image.height} · ${image.masks.length} mask${image.masks.length === 1 ? '' : 's'}`}</small>
                </span>
              </button>
            ))
          )}
        </aside>

        <div className="image-mask-workspace">
          <div className="image-mask-toolbar">
            <SegmentedTabs compact ariaLabel="Image mask mode" options={imageMaskModeOptions} value={mode} onChange={handleModeChange} />
            <Field label="Strength" compact>
              <input type="range" min={4} max={32} value={strength} onChange={(event) => handleStrengthChange(Number(event.target.value))} />
            </Field>
            <Field label={`Zoom ${Math.round(zoom * 100)}%`} compact>
              <input type="range" min={1} max={4} step={0.25} value={zoom} disabled={!activeImage} onChange={(event) => setZoom(clampZoom(Number(event.target.value)))} />
            </Field>
          </div>

          <div className={`image-mask-canvas-shell ${activeImage && zoom > 1 ? 'zoomed' : ''}`} ref={shellRef} onWheel={handleWheel}>
            {!activeImage && (
              <div className="empty-state">
                <strong>Upload an image, then drag to mask sensitive areas.</strong>
                <span>Draw multiple regions, move or resize selected masks, then export as PNG.</span>
              </div>
            )}
            <canvas
              aria-label="Image masking canvas"
              className={activeImage ? 'ready' : ''}
              ref={canvasRef}
              onPointerCancel={() => {
                interactionRef.current = null;
                setDrawing(null);
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishDrawing}
            />
          </div>
        </div>
      </div>

      <ActionBar>
        <ToolbarButton title="Fit image to canvas" onClick={() => setZoom(1)} disabled={!activeImage || zoom === 1}>
          <RotateCcw size={16} />
          <span>Fit</span>
        </ToolbarButton>
        <ToolbarButton title="Undo last mask" onClick={undoMask} disabled={!activeImage?.masks.length}>
          <Undo2 size={16} />
          <span>Undo</span>
        </ToolbarButton>
        <ToolbarButton title="Clear masks from current image" onClick={clearMasks} disabled={!activeImage?.masks.length}>
          <Trash2 size={16} />
          <span>Clear masks</span>
        </ToolbarButton>
        <ToolbarButton title="Reset image mask tool to empty" onClick={resetImages} disabled={!images.length}>
          <Trash2 size={16} />
          <span>Clean all</span>
        </ToolbarButton>
        <ToolbarButton title="Apply current regions to all images" onClick={applyMasksToAll} disabled={!activeImage?.masks.length || images.length < 2}>
          <ImagePlus size={16} />
          <span>Apply to all</span>
        </ToolbarButton>
        <ToolbarButton title="Export current masked image" variant="primary" onClick={() => activeImage && exportImage(activeImage)} disabled={!activeImage}>
          <Download size={16} />
          <span>Export current</span>
        </ToolbarButton>
        <ToolbarButton title="Export all masked images" variant="primary" onClick={() => images.forEach((image, index) => window.setTimeout(() => exportImage(image), index * 180))} disabled={!images.length}>
          <Download size={16} />
          <span>Export batch</span>
        </ToolbarButton>
      </ActionBar>

      <MetricsGrid
        items={[
          { label: 'Active image', value: activeImage?.name ?? '-' },
          { label: 'Current masks', value: activeImage?.masks.length ?? '-' },
          { label: 'Total images', value: images.length },
          { label: 'Total masks', value: totalMasks || '-' },
        ]}
      />
    </>
  );
}

export { ImageMaskPanel };

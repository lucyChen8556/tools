import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, WheelEvent } from 'react';
import {
  imageMaskCanvasFitConfig,
  imageMaskDefaultMode,
  imageMaskInteractionConfig,
  imageMaskStrengthConfig,
  imageMaskZoomConfig,
  type DrawingState,
  type ImageMask,
  type ImageMaskMode,
  type InteractionState,
  type MaskImage,
  type Point,
  type ResizeHandle,
} from './constants';
import {
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
} from './imageMaskUtils';

function useImageMaskWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<MaskImage[]>([]);
  const interactionRef = useRef<InteractionState | null>(null);
  const [images, setImages] = useState<MaskImage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<ImageMaskMode>(imageMaskDefaultMode);
  const [strength, setStrength] = useState(imageMaskStrengthConfig.defaultValue);
  const [zoom, setZoom] = useState(imageMaskZoomConfig.defaultValue);
  const [selectedMaskIndex, setSelectedMaskIndex] = useState<number | null>(null);
  const [drawing, setDrawing] = useState<DrawingState | null>(null);

  const activeImage = useMemo(() => images.find((image) => image.id === activeId) ?? null, [activeId, images]);
  const selectedMask = activeImage && selectedMaskIndex !== null ? activeImage.masks[selectedMaskIndex] : null;
  const totalMasks = images.reduce((sum, image) => sum + image.masks.length, 0);

  function fitCanvasToShell(image: MaskImage) {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;

    const shellRect = shell.getBoundingClientRect();
    const maxWidth = Math.max(shellRect.width - imageMaskCanvasFitConfig.padding, imageMaskCanvasFitConfig.minSize);
    const maxHeight = Math.max(shellRect.height - imageMaskCanvasFitConfig.padding, imageMaskCanvasFitConfig.minSize);
    const fitScale = Math.min(maxWidth / image.width, maxHeight / image.height);
    const scale = fitScale * zoom;
    const displayWidth = Math.max(1, Math.round(image.width * scale));
    const displayHeight = Math.max(1, Math.round(image.height * scale));

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.width = displayWidth;
    canvas.height = displayHeight;
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

  function deleteSelectedMask() {
    if (selectedMaskIndex === null) return;
    interactionRef.current = null;
    setDrawing(null);
    updateActiveImageMasks((masks) => masks.filter((_, index) => index !== selectedMaskIndex));
    setSelectedMaskIndex((current) => {
      if (current === null) return null;
      const nextLength = Math.max((activeImage?.masks.length ?? 1) - 1, 0);
      if (!nextLength) return null;
      return Math.min(current, nextLength - 1);
    });
  }

  function duplicateSelectedMask() {
    if (!selectedMask) return;
    const duplicatedMask = {
      ...selectedMask,
      x: clamp(selectedMask.x + imageMaskInteractionConfig.duplicateOffset, 0, 1 - selectedMask.w),
      y: clamp(selectedMask.y + imageMaskInteractionConfig.duplicateOffset, 0, 1 - selectedMask.h),
    };
    updateActiveImageMasks((masks) => [...masks, duplicatedMask]);
    setSelectedMaskIndex(activeImage?.masks.length ?? 0);
  }

  function resetImages() {
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    imagesRef.current = [];
    interactionRef.current = null;
    setImages([]);
    setActiveId(null);
    setMode(imageMaskDefaultMode);
    setStrength(imageMaskStrengthConfig.defaultValue);
    setSelectedMaskIndex(null);
    setDrawing(null);
    setZoom(imageMaskZoomConfig.defaultValue);
  }

  function applyMasksToAll() {
    if (!activeImage?.masks.length) return;
    const copiedMasks = activeImage.masks.map((mask) => ({ ...mask }));
    setImages((current) =>
      current.map((image) => (image.id === activeImage.id ? image : { ...image, masks: copiedMasks.map((mask) => ({ ...mask })) })),
    );
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

    if (rect.w <= imageMaskInteractionConfig.minSize || rect.h <= imageMaskInteractionConfig.minSize) return;

    updateActiveImageMasks((masks) => [...masks, { ...rect, mode, strength }]);
    setSelectedMaskIndex(activeImage?.masks.length ?? 0);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!activeImage) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoom((current) => clampZoom(current + direction * imageMaskZoomConfig.step));
  }

  function setZoomValue(value: number) {
    setZoom(clampZoom(value));
  }

  function fitImage() {
    setZoom(imageMaskZoomConfig.defaultValue);
  }

  function cancelInteraction() {
    interactionRef.current = null;
    setDrawing(null);
  }

  function selectMask(index: number) {
    if (!activeImage?.masks[index]) return;
    const mask = activeImage.masks[index];
    setSelectedMaskIndex(index);
    setMode(mask.mode);
    setStrength(mask.strength);
  }

  return {
    activeId,
    activeImage,
    addFiles,
    applyMasksToAll,
    cancelInteraction,
    canvasRef,
    clearMasks,
    deleteSelectedMask,
    duplicateSelectedMask,
    exportImage: exportMaskedImage,
    finishDrawing,
    fitImage,
    formatPercent,
    handleModeChange,
    handlePointerDown,
    handlePointerMove,
    handleStrengthChange,
    handleWheel,
    images,
    mode,
    resetImages,
    selectImage,
    selectMask,
    selectedMask,
    selectedMaskIndex,
    shellRef,
    strength,
    totalMasks,
    undoMask,
    zoom,
    setZoomValue,
  };
}

export { useImageMaskWorkspace };

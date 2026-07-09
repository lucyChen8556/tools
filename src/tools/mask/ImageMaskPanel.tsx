import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { MetricsGrid } from '@/components/ToolLayout';
import type { ToolMetric } from '@/components/ToolLayout';
import { ImageMaskActionBar } from './ImageMaskActionBar';
import { ImageMaskLayout } from './ImageMaskLayout';
import { imageMaskCopy } from './constants';
import { useImageMaskWorkspace } from './useImageMaskWorkspace';

function ImageMaskPanel() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const {
    activeId,
    activeImage,
    addFiles,
    applyMasksToAll,
    cancelInteraction,
    canvasRef,
    clearMasks,
    deleteSelectedMask,
    duplicateSelectedMask,
    exportImage,
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
    setZoomValue,
    shellRef,
    strength,
    totalMasks,
    undoMask,
    zoom,
  } = useImageMaskWorkspace();

  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Active image', value: activeImage?.name ?? '-' },
      { label: 'Current masks', value: activeImage?.masks.length ?? '-' },
      { label: 'Total images', value: images.length },
      { label: 'Total masks', value: totalMasks || '-' },
    ],
    [activeImage?.masks.length, activeImage?.name, images.length, totalMasks],
  );

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    addFiles(event.dataTransfer.files);
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
        onDrop={handleDrop}
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
          <span>{imageMaskCopy.upload}</span>
        </label>
      </div>

      <ImageMaskLayout
        activeId={activeId}
        activeImage={activeImage}
        cancelInteraction={cancelInteraction}
        canvasRef={canvasRef}
        finishDrawing={finishDrawing}
        formatPercent={formatPercent}
        handleModeChange={handleModeChange}
        handlePointerDown={handlePointerDown}
        handlePointerMove={handlePointerMove}
        handleStrengthChange={handleStrengthChange}
        handleWheel={handleWheel}
        images={images}
        mode={mode}
        selectImage={selectImage}
        selectMask={selectMask}
        selectedMaskIndex={selectedMaskIndex}
        setZoomValue={setZoomValue}
        shellRef={shellRef}
        strength={strength}
        zoom={zoom}
      />

      <ImageMaskActionBar
        activeImage={activeImage}
        applyMasksToAll={applyMasksToAll}
        clearMasks={clearMasks}
        deleteSelectedMask={deleteSelectedMask}
        duplicateSelectedMask={duplicateSelectedMask}
        exportImage={exportImage}
        fitImage={fitImage}
        images={images}
        resetImages={resetImages}
        selectedMask={selectedMask}
        selectedMaskIndex={selectedMaskIndex}
        undoMask={undoMask}
        zoom={zoom}
      />

      <MetricsGrid items={metricsItems} />
    </>
  );
}

export { ImageMaskPanel };

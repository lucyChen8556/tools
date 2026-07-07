import { useState } from 'react';
import type { DragEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { Field } from '../../components/Field';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { MetricsGrid } from '../../components/ToolLayout';
import { ImageMaskActionBar } from './ImageMaskActionBar';
import { imageMaskModeOptions, imageMaskZoomConfig } from './constants';
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

          {activeImage ? (
            <div className="image-mask-regions">
              <div className="image-mask-list-header">
                <span>{activeImage.masks.length} regions</span>
              </div>
              {activeImage.masks.length === 0 ? (
                <div className="empty-state compact">No regions yet</div>
              ) : (
                activeImage.masks.map((mask, index) => (
                  <button className={`image-mask-region ${selectedMaskIndex === index ? 'active' : ''}`} key={`${mask.x}-${mask.y}-${index}`} type="button" onClick={() => selectMask(index)}>
                    <strong>{`#${index + 1} ${mask.mode}`}</strong>
                    <span>{`${formatPercent(mask.w)} x ${formatPercent(mask.h)} · strength ${mask.strength}`}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </aside>

        <div className="image-mask-workspace">
          <div className="image-mask-toolbar">
            <SegmentedTabs compact ariaLabel="Image mask mode" options={imageMaskModeOptions} value={mode} onChange={handleModeChange} />
            <Field label="Strength" compact>
              <input type="range" min={4} max={32} value={strength} onChange={(event) => handleStrengthChange(Number(event.target.value))} />
            </Field>
            <Field label={`Zoom ${Math.round(zoom * 100)}%`} compact>
              <input
                type="range"
                min={imageMaskZoomConfig.min}
                max={imageMaskZoomConfig.max}
                step={imageMaskZoomConfig.step}
                value={zoom}
                disabled={!activeImage}
                onChange={(event) => setZoomValue(Number(event.target.value))}
              />
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
              onPointerCancel={cancelInteraction}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishDrawing}
            />
          </div>
        </div>
      </div>

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

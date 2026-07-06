import { useState } from 'react';
import type { DragEvent } from 'react';
import { Copy, Download, ImagePlus, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { Field } from '../../components/Field';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { ActionBar, MetricsGrid } from '../../components/ToolLayout';
import { ToolbarButton } from '../../components/ToolbarButton';
import { useImageMaskWorkspace } from '../../hooks/useImageMaskWorkspace';
import { imageMaskModeOptions, imageMaskZoomConfig } from './constants';

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

      <ActionBar>
        <ToolbarButton title="Fit image to canvas" onClick={fitImage} disabled={!activeImage || zoom === 1}>
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
        <ToolbarButton title="Duplicate selected mask" onClick={duplicateSelectedMask} disabled={!selectedMask}>
          <Copy size={16} />
          <span>Duplicate</span>
        </ToolbarButton>
        <ToolbarButton title="Delete selected mask" onClick={deleteSelectedMask} disabled={selectedMaskIndex === null}>
          <Trash2 size={16} />
          <span>Delete selected</span>
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

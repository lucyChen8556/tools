import type { PointerEventHandler, RefObject, WheelEventHandler } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Field } from '@/components/Field';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { imageMaskCopy, imageMaskModeOptions, imageMaskStrengthConfig, imageMaskZoomConfig, type ImageMaskMode, type MaskImage } from './constants';

type ImageMaskLayoutProps = {
  activeId: string | null;
  activeImage: MaskImage | null;
  cancelInteraction: PointerEventHandler<HTMLCanvasElement>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  finishDrawing: PointerEventHandler<HTMLCanvasElement>;
  formatPercent: (value: number) => string;
  handleModeChange: (mode: ImageMaskMode) => void;
  handlePointerDown: PointerEventHandler<HTMLCanvasElement>;
  handlePointerMove: PointerEventHandler<HTMLCanvasElement>;
  handleStrengthChange: (value: number) => void;
  handleWheel: WheelEventHandler<HTMLDivElement>;
  images: MaskImage[];
  mode: ImageMaskMode;
  selectImage: (image: MaskImage) => void;
  selectMask: (index: number) => void;
  selectedMaskIndex: number | null;
  setZoomValue: (value: number) => void;
  shellRef: RefObject<HTMLDivElement | null>;
  strength: number;
  zoom: number;
};

function ImageMaskLayout({
  activeId,
  activeImage,
  cancelInteraction,
  canvasRef,
  finishDrawing,
  formatPercent,
  handleModeChange,
  handlePointerDown,
  handlePointerMove,
  handleStrengthChange,
  handleWheel,
  images,
  mode,
  selectImage,
  selectMask,
  selectedMaskIndex,
  setZoomValue,
  shellRef,
  strength,
  zoom,
}: ImageMaskLayoutProps) {
  return (
    <div className="image-mask-layout">
      <aside className="image-mask-list" aria-label="Uploaded images">
        <div className="image-mask-list-header">
          <span>{images.length} images</span>
        </div>
        {images.length === 0 ? (
          <EmptyState compact>{imageMaskCopy.noImages}</EmptyState>
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
              <EmptyState compact>{imageMaskCopy.noRegions}</EmptyState>
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
            <input type="range" min={imageMaskStrengthConfig.min} max={imageMaskStrengthConfig.max} value={strength} onChange={(event) => handleStrengthChange(Number(event.target.value))} />
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
            <EmptyState title={imageMaskCopy.emptyTitle} description={imageMaskCopy.emptyDescription} />
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
  );
}

export { ImageMaskLayout };

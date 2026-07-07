import { Copy, Download, ImagePlus, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { ActionBar } from '../../components/ToolLayout';
import { ToolbarButton } from '../../components/ToolbarButton';
import { imageMaskInteractionConfig, type ImageMask, type MaskImage } from './constants';

type ImageMaskActionBarProps = {
  activeImage: MaskImage | null;
  applyMasksToAll: () => void;
  clearMasks: () => void;
  deleteSelectedMask: () => void;
  duplicateSelectedMask: () => void;
  exportImage: (image: MaskImage) => void;
  fitImage: () => void;
  images: MaskImage[];
  resetImages: () => void;
  selectedMask: ImageMask | null;
  selectedMaskIndex: number | null;
  undoMask: () => void;
  zoom: number;
};

function ImageMaskActionBar({
  activeImage,
  applyMasksToAll,
  clearMasks,
  deleteSelectedMask,
  duplicateSelectedMask,
  exportImage,
  fitImage,
  images,
  resetImages,
  selectedMask,
  selectedMaskIndex,
  undoMask,
  zoom,
}: ImageMaskActionBarProps) {
  return (
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
      <ToolbarButton title="Export all masked images" variant="primary" onClick={() => images.forEach((image, index) => window.setTimeout(() => exportImage(image), index * imageMaskInteractionConfig.exportBatchDelayMs))} disabled={!images.length}>
        <Download size={16} />
        <span>Export batch</span>
      </ToolbarButton>
    </ActionBar>
  );
}

export { ImageMaskActionBar };

import { Copy, Download, ImagePlus, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { ActionBar } from '@/components/ToolLayout';
import { ToolbarButton } from '@/components/ToolbarButton';
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
      <ToolbarButton title="Fit image to canvas" icon={<RotateCcw size={16} />} label="Fit" onClick={fitImage} disabled={!activeImage || zoom === 1} />
      <ToolbarButton title="Undo last mask" icon={<Undo2 size={16} />} label="Undo" onClick={undoMask} disabled={!activeImage?.masks.length} />
      <ToolbarButton title="Clear masks from current image" icon={<Trash2 size={16} />} label="Clear masks" onClick={clearMasks} disabled={!activeImage?.masks.length} />
      <ToolbarButton title="Duplicate selected mask" icon={<Copy size={16} />} label="Duplicate" onClick={duplicateSelectedMask} disabled={!selectedMask} />
      <ToolbarButton title="Delete selected mask" icon={<Trash2 size={16} />} label="Delete selected" onClick={deleteSelectedMask} disabled={selectedMaskIndex === null} />
      <ToolbarButton title="Reset image mask tool to empty" icon={<Trash2 size={16} />} label="Clean all" onClick={resetImages} disabled={!images.length} />
      <ToolbarButton title="Apply current regions to all images" icon={<ImagePlus size={16} />} label="Apply to all" onClick={applyMasksToAll} disabled={!activeImage?.masks.length || images.length < 2} />
      <ToolbarButton title="Export current masked image" variant="primary" icon={<Download size={16} />} label="Export current" onClick={() => activeImage && exportImage(activeImage)} disabled={!activeImage} />
      <ToolbarButton title="Export all masked images" variant="primary" icon={<Download size={16} />} label="Export batch" onClick={() => images.forEach((image, index) => window.setTimeout(() => exportImage(image), index * imageMaskInteractionConfig.exportBatchDelayMs))} disabled={!images.length} />
    </ActionBar>
  );
}

export { ImageMaskActionBar };

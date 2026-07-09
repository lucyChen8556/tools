import type { OutputFormat } from '@/config/options';

type ImageCompressionStats = {
  original: number;
  compressed: number;
  width: number;
  height: number;
};

function readImageFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = source;
  });
}

async function compressImagePreview(input: {
  file: File;
  preview: string;
  maxWidth: number;
  outputFormat: OutputFormat;
  quality: number;
}) {
  const image = await loadImage(input.preview);
  const ratio = Math.min(1, input.maxWidth / image.width);
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, input.outputFormat, input.quality));
  if (!blob) return null;

  return {
    blob,
    stats: {
      original: input.file.size,
      compressed: blob.size,
      width,
      height,
    } satisfies ImageCompressionStats,
  };
}

export { compressImagePreview, readImageFileAsDataUrl };
export type { ImageCompressionStats };

import { useEffect, useState } from 'react';
import { seasonColorDefaults } from './seasonColorData';
import { extractPhotoSwatches } from './seasonColorUtils';
import type { SeasonSwatch } from './seasonColorTypes';

function usePhotoSwatches(onApply: (swatches: SeasonSwatch[]) => void) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoSwatches, setPhotoSwatches] = useState<SeasonSwatch[]>([]);
  const [photoStatus, setPhotoStatus] = useState(seasonColorDefaults.photoStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  async function loadPhoto(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoStatus('Please choose an image file.');
      return;
    }

    setLoading(true);
    setPhotoStatus('Reading the photo and extracting colors...');

    try {
      const { image, url } = await loadImageFromFile(file);
      setPhotoUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      const swatches = extractPhotoSwatches(image);
      setPhotoSwatches(swatches);
      if (swatches.length === 0) {
        setPhotoStatus('No clear color samples were detected. Try a naturally lit photo with a clear face reference.');
        return;
      }
      setPhotoStatus(`Detected ${swatches.length} color samples. Adjust the groups before reviewing the result.`);
      onApply(swatches);
    } catch {
      setPhotoStatus('The photo could not be read. Try another image.');
    } finally {
      setLoading(false);
    }
  }

  function updatePhotoGroup(index: number, group: SeasonSwatch['group']) {
    setPhotoSwatches((current) => {
      const next = current.map((swatch, swatchIndex) => (swatchIndex === index ? { ...swatch, group } : swatch));
      onApply(next);
      return next;
    });
    setPhotoStatus('Photo color group updated. The analysis has been recalculated.');
  }

  function applyPhotoSwatches() {
    if (photoSwatches.length === 0) return;
    onApply(photoSwatches);
    setPhotoStatus(`Applied ${photoSwatches.length} photo-extracted color samples.`);
  }

  function clearPhoto() {
    setPhotoUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return '';
    });
    setPhotoSwatches([]);
    setPhotoStatus(seasonColorDefaults.photoStatus);
    setLoading(false);
  }

  return { applyPhotoSwatches, clearPhoto, loadPhoto, loading, photoStatus, photoSwatches, photoUrl, updatePhotoGroup };
}

function loadImageFromFile(file: File) {
  return new Promise<{ image: HTMLImageElement; url: string }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Photo load failed'));
    };
    image.src = url;
  });
}

export { usePhotoSwatches };

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
      setPhotoStatus('請選擇圖片檔。');
      return;
    }

    setLoading(true);
    setPhotoStatus('正在讀取照片並抽色...');

    try {
      const { image, url } = await loadImageFromFile(file);
      setPhotoUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      const swatches = extractPhotoSwatches(image);
      setPhotoSwatches(swatches);
      if (swatches.length === 0) {
        setPhotoStatus('沒有抽到足夠明確的色片，建議換成自然光、臉部清楚的照片。');
        return;
      }
      setPhotoStatus(`已自動推測 ${swatches.length} 個色票，可調整分類後再判斷。`);
      onApply(swatches);
    } catch {
      setPhotoStatus('照片讀取失敗，請換一張圖片再試。');
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
    setPhotoStatus('已更新照片色片分類，分析結果已同步重算。');
  }

  function applyPhotoSwatches() {
    if (photoSwatches.length === 0) return;
    onApply(photoSwatches);
    setPhotoStatus(`已套用照片自動抽出的 ${photoSwatches.length} 個色票。`);
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

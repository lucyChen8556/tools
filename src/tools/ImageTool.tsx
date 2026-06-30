import { ChangeEvent, useState } from 'react';
import { Download } from 'lucide-react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import { ToolbarButton } from '../components/ToolbarButton';
import { downloadBlob } from '../utils/file';

function ImageTool() {
  const [fileName, setFileName] = useState('');
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [preview, setPreview] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [stats, setStats] = useState({ original: 0, compressed: 0, width: 0, height: 0 });
  const [status, setStatus] = useState('');

  async function compressImage(file: File) {
    setFileName(file.name);
    setStatus('Processing');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });

    const ratio = Math.min(1, maxWidth / image.width);
    const width = Math.round(image.width * ratio);
    const height = Math.round(image.height * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return;

    if (resultUrl) URL.revokeObjectURL(resultUrl);
    const nextUrl = URL.createObjectURL(blob);
    setPreview(dataUrl);
    setResultUrl(nextUrl);
    setStats({ original: file.size, compressed: blob.size, width, height });
    setStatus('Ready');
  }

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="Image" compact>
          <input
            type="file"
            accept="image/*"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (file) void compressImage(file);
            }}
          />
        </Field>
        <Field label="Quality" compact>
          <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
        </Field>
        <Field label="Max width" compact>
          <input type="number" min="100" value={maxWidth} onChange={(event) => setMaxWidth(Number(event.target.value))} />
        </Field>
        <ToolbarButton
          title="Download image"
          variant="primary"
          disabled={!resultUrl}
          onClick={() => {
            if (resultUrl) {
              fetch(resultUrl)
                .then((response) => response.blob())
                .then((blob) => downloadBlob(blob, `${fileName.replace(/\.[^.]+$/, '') || 'image'}-compressed.jpg`));
            }
          }}
        >
          <Download size={16} />
          <span>Download</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Status" value={status || '-'} />
        <Stat label="Original" value={stats.original ? `${Math.round(stats.original / 1024)} KB` : '-'} />
        <Stat label="Compressed" value={stats.compressed ? `${Math.round(stats.compressed / 1024)} KB` : '-'} />
        <Stat label="Size" value={stats.width ? `${stats.width} x ${stats.height}` : '-'} />
      </div>
      <div className="image-preview-grid">
        <div>{preview ? <img src={preview} alt="Original preview" /> : <div className="empty-state">Original</div>}</div>
        <div>{resultUrl ? <img src={resultUrl} alt="Compressed preview" /> : <div className="empty-state">Compressed</div>}</div>
      </div>
    </section>
  );
}
export { ImageTool };

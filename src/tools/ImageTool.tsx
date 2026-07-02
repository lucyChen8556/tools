import { ChangeEvent, useState } from 'react';
import { Download, Eraser, ImageDown } from 'lucide-react';
import { Field } from '../components/Field';
import { SelectField } from '../components/SelectField';
import { Stat } from '../components/Stat';
import { TextInputField } from '../components/TextInputField';
import { ToolbarButton } from '../components/ToolbarButton';
import {
  compressionPresetOptions,
  outputFormatOptions,
  type CompressionPreset,
  type OutputFormat,
} from '../config/options';
import { downloadBlob } from '../utils/file';

function ImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [preset, setPreset] = useState<CompressionPreset>('balanced');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg');
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [preview, setPreview] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [stats, setStats] = useState({ original: 0, compressed: 0, width: 0, height: 0 });
  const [status, setStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const selectedFormat = outputFormatOptions.find((option) => option.value === outputFormat) ?? outputFormatOptions[0];

  async function readImagePreview(nextFile: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(nextFile);
    });
    setFile(nextFile);
    setFileName(nextFile.name);
    setPreview(dataUrl);
    setStats({ original: nextFile.size, compressed: 0, width: 0, height: 0 });
    setStatus('Selected');
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
  }

  async function compressImage() {
    if (!file) return;

    setStatus('Processing');

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = preview;
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
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputFormat, quality));
    if (!blob) return;

    if (resultUrl) URL.revokeObjectURL(resultUrl);
    const nextUrl = URL.createObjectURL(blob);
    setResultUrl(nextUrl);
    setStats({ original: file.size, compressed: blob.size, width, height });
    setStatus('Ready');
  }

  function updatePreset(nextPreset: CompressionPreset) {
    setPreset(nextPreset);
    const selectedPreset = compressionPresetOptions.find((option) => option.value === nextPreset);
    if (selectedPreset && 'quality' in selectedPreset) {
      setQuality(selectedPreset.quality);
      setMaxWidth(selectedPreset.maxWidth);
    }
  }

  function resetOptions() {
    updatePreset('balanced');
    setOutputFormat('image/jpeg');
    setStatus(file ? 'Selected' : '');
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    setStats((current) => ({ ...current, compressed: 0, width: 0, height: 0 }));
  }

  function clearImage() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setFileName('');
    setPreview('');
    setResultUrl('');
    setStats({ original: 0, compressed: 0, width: 0, height: 0 });
    setStatus('');
    setDragActive(false);
    setInputKey((key) => key + 1);
  }

  function handleFiles(files: FileList | null) {
    const nextFile = files?.[0];
    if (nextFile && nextFile.type.startsWith('image/')) {
      void readImagePreview(nextFile);
    }
  }

  return (
    <section className="tool-surface">
      <label
        className={`dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        <input
          key={inputKey}
          type="file"
          accept="image/*"
          onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)}
        />
        <ImageDown size={24} />
        <span>{fileName || 'Drop image here or click to upload'}</span>
      </label>

      <div className="inline-controls wide">
        <SelectField label="Preset" value={preset} options={compressionPresetOptions} onChange={updatePreset} />
        <SelectField label="Format" value={outputFormat} options={outputFormatOptions} onChange={setOutputFormat} />
        <Field label="Quality" compact>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={quality}
            onChange={(event) => {
              setPreset('custom');
              setQuality(Number(event.target.value));
            }}
          />
        </Field>
        <TextInputField
          label="Max width"
          type="number"
          min="100"
          value={maxWidth}
          compact
          onChange={(nextMaxWidth) => {
            setPreset('custom');
            setMaxWidth(Number(nextMaxWidth));
          }}
        />
        <ToolbarButton title="Compress image" variant="primary" disabled={!file} onClick={() => void compressImage()}>
          <ImageDown size={16} />
          <span>Compress</span>
        </ToolbarButton>
        <ToolbarButton
          title="Download image"
          disabled={!resultUrl}
          onClick={() => {
            if (resultUrl) {
              fetch(resultUrl)
                .then((response) => response.blob())
                .then((blob) => downloadBlob(blob, `${fileName.replace(/\.[^.]+$/, '') || 'image'}-compressed.${selectedFormat.extension}`));
            }
          }}
        >
          <Download size={16} />
          <span>Download</span>
        </ToolbarButton>
        <ToolbarButton title="Reset compression options" onClick={resetOptions}>
          <Eraser size={16} />
          <span>Reset</span>
        </ToolbarButton>
        <ToolbarButton title="Clear image" onClick={clearImage} disabled={!file && !resultUrl}>
          <Eraser size={16} />
          <span>Clear</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Status" value={status || '-'} />
        <Stat label="Original" value={stats.original ? `${Math.round(stats.original / 1024)} KB` : '-'} />
        <Stat label="Compressed" value={stats.compressed ? `${Math.round(stats.compressed / 1024)} KB` : '-'} />
        <Stat label="Size" value={stats.width ? `${stats.width} x ${stats.height}` : '-'} />
        <Stat label="Format" value={selectedFormat.extension.toUpperCase()} />
      </div>
      <div className="image-preview-grid">
        <div>{preview ? <img src={preview} alt="Original preview" /> : <div className="empty-state">Original</div>}</div>
        <div>{resultUrl ? <img src={resultUrl} alt="Compressed preview" /> : <div className="empty-state">Compressed</div>}</div>
      </div>
    </section>
  );
}
export { ImageTool };

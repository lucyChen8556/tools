import { ChangeEvent, useMemo, useState } from 'react';
import { Download, Eraser, ImageDown } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import {
  compressionPresetOptions,
  outputFormatOptions,
  type CompressionPreset,
  type OutputFormat,
} from '../config/options';
import { downloadBlob } from '../utils/file';
import { compressImagePreview, readImageFileAsDataUrl } from './image/imageUtils';

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
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Status', value: status || '-' },
      { label: 'Original', value: stats.original ? `${Math.round(stats.original / 1024)} KB` : '-' },
      { label: 'Compressed', value: stats.compressed ? `${Math.round(stats.compressed / 1024)} KB` : '-' },
      { label: 'Size', value: stats.width ? `${stats.width} x ${stats.height}` : '-' },
      { label: 'Format', value: selectedFormat.extension.toUpperCase() },
    ],
    [selectedFormat.extension, stats.compressed, stats.height, stats.original, stats.width, status],
  );

  async function readImagePreview(nextFile: File) {
    const dataUrl = await readImageFileAsDataUrl(nextFile);
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

    const compressed = await compressImagePreview({ file, maxWidth, outputFormat, preview, quality });
    if (!compressed) return;

    if (resultUrl) URL.revokeObjectURL(resultUrl);
    const nextUrl = URL.createObjectURL(compressed.blob);
    setResultUrl(nextUrl);
    setStats(compressed.stats);
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
      <ToolSection title="Upload">
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
      </ToolSection>

      <ToolSection title="Compression">
        <div className="section-controls">
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
        </div>
        <div className="section-actions">
          <ToolbarButton title="Compress image" variant="primary" icon={<ImageDown size={16} />} label="Compress" disabled={!file} onClick={() => void compressImage()} />
          <ToolbarButton
            title="Download image"
            icon={<Download size={16} />}
            label="Download"
            disabled={!resultUrl}
            onClick={() => {
              if (resultUrl) {
                fetch(resultUrl)
                  .then((response) => response.blob())
                  .then((blob) => downloadBlob(blob, `${fileName.replace(/\.[^.]+$/, '') || 'image'}-compressed.${selectedFormat.extension}`));
              }
            }}
          />
          <ToolbarButton title="Reset compression options" icon={<Eraser size={16} />} label="Reset" onClick={resetOptions} />
          <ToolbarButton title="Clear image" icon={<Eraser size={16} />} label="Clear" onClick={clearImage} disabled={!file && !resultUrl} />
        </div>
      </ToolSection>

      <ToolSection title="Summary">
        <MetricsGrid items={metricsItems} />
      </ToolSection>

      <ToolSection title="Preview">
        <div className="image-preview-grid">
          <div>{preview ? <img src={preview} alt="Original preview" /> : <EmptyState>Original</EmptyState>}</div>
          <div>{resultUrl ? <img src={resultUrl} alt="Compressed preview" /> : <EmptyState>Compressed</EmptyState>}</div>
        </div>
      </ToolSection>
    </section>
  );
}
export { ImageTool };

import type { ReactNode } from 'react';
import {
  Binary,
  Braces,
  Clock3,
  Code2,
  Diff,
  Eraser,
  FileSpreadsheet,
  Fingerprint,
  ImageDown,
  KeyRound,
  Link2,
  Palette,
  ReceiptText,
  Regex,
  Ruler,
  Table2,
  Type,
} from 'lucide-react';
import type { ToolId } from '../types';

export const tools: Array<{
  id: ToolId;
  name: string;
  shortName: string;
  group: string;
  icon: ReactNode;
}> = [
  { id: 'json', name: 'JSON Lab', shortName: 'JSON', group: 'Data', icon: <Braces size={18} /> },
  { id: 'text-diff', name: 'What Changed?', shortName: 'Diff', group: 'Text', icon: <Diff size={18} /> },
  { id: 'markdown-table', name: 'Markdown Table Formatter', shortName: 'Table', group: 'Text', icon: <Table2 size={18} /> },
  { id: 'text-cleaner', name: 'Text Cleaner', shortName: 'Clean', group: 'Text', icon: <Eraser size={18} /> },
  { id: 'time', name: 'Time Converter', shortName: 'Time', group: 'Time', icon: <Clock3 size={18} /> },
  { id: 'text', name: 'Text Processor', shortName: 'Text', group: 'Text', icon: <Type size={18} /> },
  { id: 'image', name: 'Image Compressor', shortName: 'Image', group: 'Media', icon: <ImageDown size={18} /> },
  { id: 'color', name: 'Color Converter', shortName: 'Color', group: 'Design', icon: <Palette size={18} /> },
  { id: 'regex', name: 'Regex Tester', shortName: 'Regex', group: 'Code', icon: <Regex size={18} /> },
  { id: 'jwt', name: 'JWT Decoder', shortName: 'JWT', group: 'Code', icon: <KeyRound size={18} /> },
  { id: 'hash', name: 'Hash Generator', shortName: 'Hash', group: 'Code', icon: <Fingerprint size={18} /> },
  { id: 'url', name: 'URL Parser', shortName: 'URL', group: 'Code', icon: <Link2 size={18} /> },
  { id: 'number', name: 'Number Base Converter', shortName: 'Base', group: 'Code', icon: <Binary size={18} /> },
  { id: 'css-unit', name: 'CSS Unit Converter', shortName: 'Units', group: 'Design', icon: <Ruler size={18} /> },
  { id: 'expense', name: 'Expense Splitter', shortName: 'Split', group: 'Life', icon: <ReceiptText size={18} /> },
  { id: 'encode', name: 'Encode / Decode', shortName: 'Codec', group: 'Code', icon: <Code2 size={18} /> },
  { id: 'csv', name: 'CSV / Excel Helper', shortName: 'CSV', group: 'Data', icon: <FileSpreadsheet size={18} /> },
];

export const starterFavorites: ToolId[] = ['json', 'text-diff', 'regex'];

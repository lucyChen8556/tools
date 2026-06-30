import type { ReactNode } from 'react';
import { Braces, Clock3, Code2, Diff, Eraser, FileSpreadsheet, ImageDown, Palette, Regex, Type } from 'lucide-react';
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
  { id: 'text-cleaner', name: 'Text Cleaner', shortName: 'Clean', group: 'Text', icon: <Eraser size={18} /> },
  { id: 'time', name: 'Time Converter', shortName: 'Time', group: 'Time', icon: <Clock3 size={18} /> },
  { id: 'text', name: 'Text Processor', shortName: 'Text', group: 'Text', icon: <Type size={18} /> },
  { id: 'image', name: 'Image Compressor', shortName: 'Image', group: 'Media', icon: <ImageDown size={18} /> },
  { id: 'color', name: 'Color Converter', shortName: 'Color', group: 'Design', icon: <Palette size={18} /> },
  { id: 'regex', name: 'Regex Tester', shortName: 'Regex', group: 'Code', icon: <Regex size={18} /> },
  { id: 'encode', name: 'Encode / Decode', shortName: 'Codec', group: 'Code', icon: <Code2 size={18} /> },
  { id: 'csv', name: 'CSV / Excel Helper', shortName: 'CSV', group: 'Data', icon: <FileSpreadsheet size={18} /> },
];

export const starterFavorites: ToolId[] = ['json', 'text-diff', 'regex'];

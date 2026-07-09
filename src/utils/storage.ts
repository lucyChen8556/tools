import type { ToolId } from '@/types';
import { tools } from '@/config/tools';

export function readStoredToolId(key: string, fallback: ToolId): ToolId {
  const value = localStorage.getItem(key);
  return tools.some((tool) => tool.id === value) ? (value as ToolId) : fallback;
}

export function readStoredToolList(key: string, fallback: ToolId[]): ToolId[] {
  const value = localStorage.getItem(key);
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.filter((id): id is ToolId => tools.some((tool) => tool.id === id));
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

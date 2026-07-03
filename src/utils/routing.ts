import { tools } from '../config/tools';
import type { ToolId } from '../types';

function isToolId(value: string | null | undefined): value is ToolId {
  return tools.some((tool) => tool.id === value);
}

function readLastPathSegment(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const segment = segments[segments.length - 1];
  return segment ? decodeURIComponent(segment) : '';
}

function readBasePath(location: Location) {
  const segments = location.pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (isToolId(lastSegment)) {
    const baseSegments = segments.slice(0, -1);
    return `/${baseSegments.join('/')}${baseSegments.length ? '/' : ''}`;
  }

  if (location.pathname.endsWith('/')) return location.pathname;
  if (location.pathname.endsWith('.html')) return location.pathname.replace(/[^/]+$/, '');
  return `${location.pathname}/`;
}

function readToolIdFromLocation(location: Location): ToolId | null {
  const pathToolId = readLastPathSegment(location.pathname);
  if (isToolId(pathToolId)) return pathToolId;

  const queryToolId = new URLSearchParams(location.search).get('tool');
  if (isToolId(queryToolId)) return queryToolId;

  return null;
}

function writeToolRoute(id: ToolId, mode: 'push' | 'replace' = 'push') {
  const nextUrl = `${readBasePath(window.location)}${encodeURIComponent(id)}`;
  if (window.location.pathname === nextUrl && !window.location.search) return;
  window.history[mode === 'replace' ? 'replaceState' : 'pushState']({ toolId: id }, '', nextUrl);
}

export { readToolIdFromLocation, writeToolRoute };

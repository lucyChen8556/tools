import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { getToolContent } from './config/toolContent';
import { starterFavorites } from './config/tools';
import type { ToolId } from './types';
import { readStoredToolId, readStoredToolList, writeStorage } from './utils/storage';
import { readToolIdFromLocation, writeToolRoute } from './utils/routing';

export function App() {
  const [activeTool, setActiveToolState] = useState<ToolId>(() => readToolIdFromLocation(window.location) ?? readStoredToolId('tools-hub.active', 'json'));
  const [favoriteIds, setFavoriteIds] = useState<ToolId[]>(() => readStoredToolList('tools-hub.favorites', starterFavorites));
  const [query, setQuery] = useState('');

  useEffect(() => {
    writeToolRoute(readToolIdFromLocation(window.location) ?? activeTool, 'replace');
    function syncRoute() {
      const nextTool = readToolIdFromLocation(window.location);
      if (nextTool) {
        setActiveToolState(nextTool);
        writeStorage('tools-hub.active', nextTool);
      }
    }

    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  function setActiveTool(id: ToolId) {
    setActiveToolState(id);
    writeStorage('tools-hub.active', id);
    writeToolRoute(id);
  }

  function toggleFavorite(id: ToolId) {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((toolId) => toolId !== id) : [...current, id];
      writeStorage('tools-hub.favorites', next);
      return next;
    });
  }

  const content = getToolContent(activeTool);

  return (
    <AppShell
      activeTool={activeTool}
      setActiveTool={setActiveTool}
      favoriteIds={favoriteIds}
      toggleFavorite={toggleFavorite}
      query={query}
      setQuery={setQuery}
    >
      {content}
    </AppShell>
  );
}

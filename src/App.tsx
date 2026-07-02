import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { starterFavorites } from './config/tools';
import type { ToolId } from './types';
import { readStoredToolId, readStoredToolList, writeStorage } from './utils/storage';
import { ColorTool } from './tools/ColorTool';
import { CsvTool } from './tools/CsvTool';
import { EncodeTool } from './tools/EncodeTool';
import { HashTool } from './tools/HashTool';
import { ImageTool } from './tools/ImageTool';
import { JsonTool } from './tools/JsonTool';
import { JwtTool } from './tools/JwtTool';
import { NumberTool } from './tools/NumberTool';
import { RegexTool } from './tools/RegexTool';
import { TextCleanerTool } from './tools/TextCleanerTool';
import { TextDiffTool } from './tools/TextDiffTool';
import { TextTool } from './tools/TextTool';
import { TimeTool } from './tools/TimeTool';
import { UrlTool } from './tools/UrlTool';

export function App() {
  const [activeTool, setActiveToolState] = useState<ToolId>(() => readStoredToolId('tools-hub.active', 'json'));
  const [favoriteIds, setFavoriteIds] = useState<ToolId[]>(() => readStoredToolList('tools-hub.favorites', starterFavorites));
  const [query, setQuery] = useState('');

  function setActiveTool(id: ToolId) {
    setActiveToolState(id);
    writeStorage('tools-hub.active', id);
  }

  function toggleFavorite(id: ToolId) {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((toolId) => toolId !== id) : [...current, id];
      writeStorage('tools-hub.favorites', next);
      return next;
    });
  }

  const content = {
    json: <JsonTool />,
    'text-diff': <TextDiffTool />,
    'text-cleaner': <TextCleanerTool />,
    time: <TimeTool />,
    text: <TextTool />,
    image: <ImageTool />,
    color: <ColorTool />,
    regex: <RegexTool />,
    jwt: <JwtTool />,
    hash: <HashTool />,
    url: <UrlTool />,
    number: <NumberTool />,
    encode: <EncodeTool />,
    csv: <CsvTool />,
  }[activeTool];

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

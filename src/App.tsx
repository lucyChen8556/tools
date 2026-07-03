import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { starterFavorites } from './config/tools';
import type { ToolId } from './types';
import { readStoredToolId, readStoredToolList, writeStorage } from './utils/storage';
import { readToolIdFromLocation, writeToolRoute } from './utils/routing';
import { ColorTool } from './tools/ColorTool';
import { CsvTool } from './tools/CsvTool';
import { DiscountTool } from './tools/DiscountTool';
import { EncodeTool } from './tools/EncodeTool';
import { ExpenseTool } from './tools/ExpenseTool';
import { HashTool } from './tools/HashTool';
import { ImageTool } from './tools/ImageTool';
import { JsonTool } from './tools/JsonTool';
import { JwtTool } from './tools/JwtTool';
import { MarkdownTableTool } from './tools/MarkdownTableTool';
import { NumberTool } from './tools/NumberTool';
import { RandomizerTool } from './tools/RandomizerTool';
import { RegexTool } from './tools/RegexTool';
import { SubscriptionTool } from './tools/SubscriptionTool';
import { TextCleanerTool } from './tools/TextCleanerTool';
import { TextDiffTool } from './tools/TextDiffTool';
import { TextTool } from './tools/TextTool';
import { TimeTool } from './tools/TimeTool';
import { UrlTool } from './tools/UrlTool';
import { CssUnitTool } from './tools/CssUnitTool';

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

  const content = {
    json: <JsonTool />,
    'text-diff': <TextDiffTool />,
    'markdown-table': <MarkdownTableTool />,
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
    'css-unit': <CssUnitTool />,
    expense: <ExpenseTool />,
    discount: <DiscountTool />,
    subscription: <SubscriptionTool />,
    randomizer: <RandomizerTool />,
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

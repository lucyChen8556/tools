import type { ReactNode } from 'react';
import { Info, Menu, Search, Shuffle, Star, StarOff, X } from 'lucide-react';
import { useState } from 'react';
import type { ToolId } from '../types';
import { tools } from '../config/tools';
import { toolHelp } from '../config/toolHelp';
import { ToolHelpDialog } from './ToolHelpDialog';

export function AppShell({
  activeTool,
  setActiveTool,
  favoriteIds,
  toggleFavorite,
  query,
  setQuery,
  children,
}: {
  activeTool: ToolId;
  setActiveTool: (id: ToolId) => void;
  favoriteIds: ToolId[];
  toggleFavorite: (id: ToolId) => void;
  query: string;
  setQuery: (query: string) => void;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const active = tools.find((tool) => tool.id === activeTool) ?? tools[0];
  const activeIsFavorite = favoriteIds.includes(active.id);
  const activeHelp = toolHelp[active.id];
  const filteredTools = tools.filter((tool) => `${tool.name} ${tool.shortName} ${tool.group}`.toLowerCase().includes(query.toLowerCase()));
  const favorites = tools.filter((tool) => favoriteIds.includes(tool.id));
  const groupedTools = filteredTools.reduce<Record<string, typeof tools>>((groups, tool) => {
    groups[tool.group] = groups[tool.group] ? [...groups[tool.group], tool] : [tool];
    return groups;
  }, {});

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark">
              <Shuffle size={20} />
            </div>
            <div>
              <h1>Tools Hub</h1>
              <p>{tools.length} tools</p>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            title={sidebarOpen ? 'Close tools menu' : 'Open tools menu'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="sidebar-content">
          <label className="search-box">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
          </label>

          {favorites.length > 0 && (
            <section className="nav-section">
              <h2>Favorites</h2>
              <div className="tool-grid compact-grid">
                {favorites.map((tool) => (
                  <button
                    className={`tool-chip ${activeTool === tool.id ? 'active' : ''}`}
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      setActiveTool(tool.id);
                      setSidebarOpen(false);
                    }}
                    title={tool.name}
                  >
                    {tool.icon}
                    <span>{tool.shortName}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <nav className="tool-nav">
            {Object.entries(groupedTools).map(([group, groupTools]) => (
              <section className="nav-section" key={group}>
                <h2>{group}</h2>
                {groupTools.map((tool) => (
                  <div className={`tool-row ${activeTool === tool.id ? 'active' : ''}`} key={tool.id}>
                    <button
                      className="tool-row-main"
                      type="button"
                      onClick={() => {
                        setActiveTool(tool.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <span className="tool-icon">{tool.icon}</span>
                      <span>{tool.name}</span>
                    </button>
                    <button
                      className="favorite-toggle"
                      type="button"
                      title={favoriteIds.includes(tool.id) ? 'Remove favorite' : 'Add favorite'}
                      aria-label={favoriteIds.includes(tool.id) ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
                      aria-pressed={favoriteIds.includes(tool.id)}
                      onClick={() => toggleFavorite(tool.id)}
                    >
                      {favoriteIds.includes(tool.id) ? <Star size={15} fill="currentColor" /> : <StarOff size={15} />}
                    </button>
                  </div>
                ))}
              </section>
            ))}
          </nav>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div className="workspace-title">
            <span className="workspace-icon">{active.icon}</span>
            <div>
              <p>{active.group}</p>
              <h2>{active.name}</h2>
            </div>
          </div>
          <div className="workspace-actions">
            <button className="ghost-button" type="button" title={`About ${active.name}`} aria-label={`About ${active.name}`} onClick={() => setHelpOpen(true)}>
              <Info size={17} />
              <span>Details</span>
            </button>
            <button
              className="ghost-button"
              type="button"
              title={activeIsFavorite ? 'Remove favorite' : 'Add favorite'}
              aria-label={activeIsFavorite ? `Remove ${active.name} from favorites` : `Add ${active.name} to favorites`}
              aria-pressed={activeIsFavorite}
              onClick={() => toggleFavorite(active.id)}
            >
              {activeIsFavorite ? <Star size={17} fill="currentColor" /> : <StarOff size={17} />}
              <span>{activeIsFavorite ? 'Favorited' : 'Add favorite'}</span>
            </button>
          </div>
        </header>
        {children}
      </main>
      {helpOpen ? (
        <ToolHelpDialog group={active.group} help={activeHelp} icon={active.icon} name={active.name} onClose={() => setHelpOpen(false)} />
      ) : null}
    </div>
  );
}

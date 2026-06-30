import type { ReactNode } from 'react';
import { Menu, Search, Shuffle, Star, StarOff, X } from 'lucide-react';
import { useState } from 'react';
import type { ToolId } from '../types';
import { tools } from '../config/tools';

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
  const active = tools.find((tool) => tool.id === activeTool) ?? tools[0];
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
                  <button
                    className={`tool-row ${activeTool === tool.id ? 'active' : ''}`}
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      setActiveTool(tool.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="tool-icon">{tool.icon}</span>
                    <span>{tool.name}</span>
                    <span
                      className="favorite-toggle"
                      role="button"
                      tabIndex={0}
                      title={favoriteIds.includes(tool.id) ? 'Remove favorite' : 'Add favorite'}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleFavorite(tool.id);
                        }
                      }}
                    >
                      {favoriteIds.includes(tool.id) ? <Star size={15} fill="currentColor" /> : <StarOff size={15} />}
                    </span>
                  </button>
                ))}
              </section>
            ))}
          </nav>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p>{active.group}</p>
            <h2>{active.name}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => toggleFavorite(active.id)}>
            {favoriteIds.includes(active.id) ? <Star size={17} fill="currentColor" /> : <StarOff size={17} />}
            <span>{favoriteIds.includes(active.id) ? 'Saved' : 'Save'}</span>
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}

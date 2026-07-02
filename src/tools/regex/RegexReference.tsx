import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { regexReferenceGroups } from './reference';

type RegexReferenceProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

function RegexReference({ open, setOpen }: RegexReferenceProps) {
  const [query, setQuery] = useState('');
  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return regexReferenceGroups;

    return regexReferenceGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${group.title} ${item.syntax} ${item.description} ${item.example}`.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);
  const itemCount = filteredGroups.reduce((count, group) => count + group.items.length, 0);

  return (
    <section className="regex-reference">
      <button className="regex-collapse-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <strong>Regex reference</strong>
        <span>{open ? `${itemCount} items` : 'Show'}</span>
        <ChevronDown className={open ? 'open' : ''} size={16} />
      </button>
      <div className={`regex-collapsible ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="regex-reference-body">
          <div className="regex-reference-content">
            <label className="regex-reference-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search syntax, unicode, flags..."
                disabled={!open}
              />
            </label>
            {filteredGroups.length === 0 ? (
              <div className="empty-state">No reference items found</div>
            ) : (
              filteredGroups.map((group) => (
                <section className="regex-reference-group" key={group.id}>
                  <h3>{group.title}</h3>
                  <div className="regex-reference-list">
                    {group.items.map((item) => (
                      <div className="regex-reference-row" key={`${group.id}-${item.syntax}-${item.example}`}>
                        <code>{item.syntax}</code>
                        <span>{item.description}</span>
                        <kbd>{item.example}</kbd>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export { RegexReference };

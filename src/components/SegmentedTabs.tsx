import { useRef } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';

type SegmentedTabOption<T extends string> = {
  label: string;
  value: T;
  title?: string;
};

type SegmentedTabsProps<T extends string> = {
  ariaLabel: string;
  options: readonly SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  compact?: boolean;
};

function SegmentedTabs<T extends string>({ ariaLabel, options, value, onChange, className = '', compact = false }: SegmentedTabsProps<T>) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));

  function moveFocus(nextIndex: number) {
    onChange(options[nextIndex].value);
    window.requestAnimationFrame(() => {
      tabsRef.current?.querySelector<HTMLButtonElement>(`[data-tab-index="${nextIndex}"]`)?.focus();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    if (event.key === 'Home') {
      moveFocus(0);
      return;
    }
    if (event.key === 'End') {
      moveFocus(options.length - 1);
      return;
    }

    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    moveFocus((activeIndex + direction + options.length) % options.length);
  }

  return (
    <div
      aria-label={ariaLabel}
      className={['segmented-tabs', compact ? 'compact' : '', className].filter(Boolean).join(' ')}
      role="tablist"
      ref={tabsRef}
      style={{ '--tab-count': options.length, '--tab-index': activeIndex } as CSSProperties}
      onKeyDown={handleKeyDown}
    >
      <span className="segmented-tabs-indicator" aria-hidden="true" />
      {options.map((option, index) => (
        <button
          aria-selected={option.value === value}
          className="segmented-tab"
          data-tab-index={index}
          key={option.value}
          role="tab"
          tabIndex={option.value === value ? 0 : -1}
          title={option.title ?? option.label}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export { SegmentedTabs };
export type { SegmentedTabOption };

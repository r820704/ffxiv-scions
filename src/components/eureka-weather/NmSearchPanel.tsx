import { useEffect, useRef, useState } from 'react';
import type { EurekaZone } from '@/data/weather-data';
import { useNmSearch } from '@/hooks/useNmSearch';
import NmSearchResultRow from './NmSearchResultRow';

interface NmSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  now: number;
  forecastCount: number;
  onScrollToCell: (zone: EurekaZone, cellIndex: number) => void;
  onOpenDetail?: (nmId: string) => void;
}

export default function NmSearchPanel({
  isOpen,
  onClose,
  now,
  forecastCount,
  onScrollToCell,
  onOpenDetail,
}: NmSearchPanelProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const results = useNmSearch(query);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScrollToCell = (zone: EurekaZone, cellIndex: number) => {
    onScrollToCell(zone, cellIndex);
    onClose();
  };

  return (
    <div
      data-search-backdrop
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl bg-card border border-border rounded-t-lg sm:rounded-lg shadow-xl flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center gap-2 p-3 border-b border-border/50">
          <span className="text-base">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋 NM 名（中／英／別名）"
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉搜尋"
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {query.trim() === '' ? (
            <div className="text-xs text-muted-foreground/70 text-center py-6">
              輸入關鍵字搜尋 NM（例：帕祖祖、Cassie、亞瑟羅）
            </div>
          ) : results.length === 0 ? (
            <div className="text-xs text-muted-foreground/70 text-center py-6">
              找不到符合「{query}」的 NM
            </div>
          ) : (
            <>
              <div className="text-[10px] text-muted-foreground/60">
                {results.length} 個結果
              </div>
              {results.map((nm) => (
                <NmSearchResultRow
                  key={nm.id}
                  nm={nm}
                  now={now}
                  forecastCount={forecastCount}
                  onScrollToCell={handleScrollToCell}
                  onOpenDetail={(id) => {
                    onOpenDetail?.(id);
                    onClose();
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

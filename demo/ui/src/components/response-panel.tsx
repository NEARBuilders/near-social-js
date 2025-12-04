import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { JsonViewer } from './json-viewer';

interface ResponsePanelProps {
  data: unknown;
  title?: string;
  variant?: 'fixed' | 'inline';
  className?: string;
}

export function ResponsePanel({
  data,
  title = 'Response',
  variant = 'fixed',
  className = '',
}: ResponsePanelProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (data !== null && data !== undefined) {
      setIsExpanded(true);
    }
  }, [data]);

  const jsonString = useMemo(
    () =>
      JSON.stringify(
        data,
        (_, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      ),
    [data]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (data === null || data === undefined) {
    return null;
  }

  const maxHeightClass = variant === 'fixed' ? 'max-h-[60vh]' : 'max-h-[400px]';

  return (
    <div
      className={`rounded-xl bg-gray-900 border border-white/10 overflow-hidden shadow-2xl pointer-events-auto ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 md:py-2 border-b border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">{title}</span>
          <span className="text-xs text-white/40 md:hidden">
            {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white cursor-pointer"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[#00EC97]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-white/50" />
          ) : (
            <ChevronUp className="h-4 w-4 text-white/50" />
          )}
        </div>
      </button>
      {isExpanded && (
        <ScrollArea className={maxHeightClass}>
          <div className="p-4 text-white/80">
            <JsonViewer data={data} />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

import { useState, memo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface JsonViewerProps {
  data: unknown;
  name?: string;
  defaultExpanded?: boolean;
  depth?: number;
}

const MAX_STRING_LENGTH = 100;
const MAX_PREVIEW_ITEMS = 3;

function JsonValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="text-gray-400">null</span>;
  }
  if (value === undefined) {
    return <span className="text-gray-400">undefined</span>;
  }
  if (typeof value === 'string') {
    const truncated = value.length > MAX_STRING_LENGTH;
    const displayValue = truncated
      ? value.slice(0, MAX_STRING_LENGTH) + '...'
      : value;
    return (
      <span className="text-[#00EC97]" title={truncated ? value : undefined}>
        "{displayValue}"
      </span>
    );
  }
  if (typeof value === 'number') {
    return <span className="text-blue-400">{value}</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-yellow-400">{String(value)}</span>;
  }
  return <span className="text-white/60">{String(value)}</span>;
}

const JsonNode = memo(function JsonNode({
  data,
  name,
  defaultExpanded = false,
  depth = 0,
}: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || depth < 2);

  if (data === null || data === undefined || typeof data !== 'object') {
    return (
      <div className="flex items-start gap-2 py-0.5">
        {name && <span className="text-white/80">{name}: </span>}
        <JsonValue value={data} />
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const length = isArray ? data.length : Object.keys(data).length;
  const isEmpty = length === 0;

  const preview = isArray
    ? `Array(${length})`
    : `Object {${length} ${length === 1 ? 'key' : 'keys'}}`;

  return (
    <div className="py-0.5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-start gap-1 hover:bg-white/5 rounded px-1 -ml-1 transition-colors text-left w-full"
      >
        {!isEmpty && (
          <span className="flex-shrink-0 mt-0.5">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/50" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/50" />
            )}
          </span>
        )}
        {isEmpty && <span className="w-3.5" />}
        {name && <span className="text-white/80">{name}: </span>}
        <span className="text-white/40">{preview}</span>
        {!isExpanded && !isEmpty && (
          <span className="text-white/20 ml-1">
            {isArray ? '[' : '{'}
            {isArray
              ? data
                  .slice(0, MAX_PREVIEW_ITEMS)
                  .map((item: unknown, i: number) => (
                    <span key={i}>
                      {i > 0 && ', '}
                      <JsonValue value={item} />
                    </span>
                  ))
              : Object.entries(data)
                  .slice(0, MAX_PREVIEW_ITEMS)
                  .map(([key, val], i) => (
                    <span key={key}>
                      {i > 0 && ', '}
                      {key}: <JsonValue value={val} />
                    </span>
                  ))}
            {length > MAX_PREVIEW_ITEMS && (
              <span className="text-white/30"> ...</span>
            )}
            {isArray ? ']' : '}'}
          </span>
        )}
      </button>

      {isExpanded && !isEmpty && (
        <div className="ml-4 border-l border-white/10 pl-2">
          {isArray
            ? (data as unknown[]).map((item, index) => (
                <JsonNode
                  key={index}
                  data={item}
                  name={String(index)}
                  depth={depth + 1}
                />
              ))
            : Object.entries(data as Record<string, unknown>).map(
                ([key, value]) => (
                  <JsonNode
                    key={key}
                    data={value}
                    name={key}
                    depth={depth + 1}
                  />
                )
              )}
        </div>
      )}
    </div>
  );
});

export function JsonViewer({ data, name, defaultExpanded }: JsonViewerProps) {
  return (
    <div className="font-mono text-sm">
      <JsonNode data={data} name={name} defaultExpanded={defaultExpanded} />
    </div>
  );
}

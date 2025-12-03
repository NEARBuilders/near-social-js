import { useState } from 'react';
import { ChevronRight, Play, Loader2 } from 'lucide-react';

interface MethodField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
}

interface MethodCardProps {
  name: string;
  description: string;
  fields: MethodField[];
  requiresWallet?: boolean;
  isConnected?: boolean;
  onExecute: (params: Record<string, string>) => Promise<unknown>;
  onResult: (result: unknown) => void;
}

export function MethodCard({
  name,
  description,
  fields,
  requiresWallet,
  isConnected,
  onExecute,
  onResult,
}: MethodCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await onExecute(formData);
      onResult(result);
    } catch (error) {
      onResult({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canExecute = !requiresWallet || isConnected;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <code className="text-[#00EC97] font-mono text-sm">{name}()</code>
          {requiresWallet && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
              wallet
            </span>
          )}
        </div>
        <ChevronRight
          className={`h-5 w-5 text-white/50 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          <p className="text-sm text-white/60 mt-3 mb-4">{description}</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs text-white/50 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-400">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:outline-none focus:border-[#00EC97]/50"
                    placeholder={field.placeholder}
                    rows={3}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:outline-none focus:border-[#00EC97]/50"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={!canExecute || isLoading}
              className="w-full mt-2 px-4 py-2 rounded-lg bg-[#00EC97] text-black font-semibold flex items-center justify-center gap-2 hover:bg-[#00d084] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLoading ? 'Executing...' : 'Execute'}
            </button>

            {requiresWallet && !isConnected && (
              <p className="text-xs text-yellow-400 text-center">
                Connect wallet to execute this method
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

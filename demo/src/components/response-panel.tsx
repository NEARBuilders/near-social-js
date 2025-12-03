import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ResponsePanelProps {
  data: unknown
  title?: string
}

export function ResponsePanel({ data, title = 'Response' }: ResponsePanelProps) {
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (data === null || data === undefined) {
    return null
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-sm text-white/70">{title}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#00EC97]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-auto max-h-96 text-sm font-mono text-white/80">
        <code>{jsonString}</code>
      </pre>
    </div>
  )
}

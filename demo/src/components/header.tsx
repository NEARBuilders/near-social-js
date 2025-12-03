import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Database, Home, Menu, Users, X } from 'lucide-react'
import { Logo } from './logo'
import { WalletButton } from './wallet-button'
import { useWallet } from '../integrations/near-wallet'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { accountId } = useWallet()

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-900/80 backdrop-blur-md text-white shadow-lg border-b border-white/10">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="ml-4">
            <Logo />
          </Link>
        </div>
        <WalletButton />
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-[#00EC97]/20 text-[#00EC97] hover:bg-[#00EC97]/30 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/graph"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-[#00EC97]/20 text-[#00EC97] hover:bg-[#00EC97]/30 transition-colors mb-2',
            }}
          >
            <Database size={20} />
            <span className="font-medium">Graph Methods</span>
          </Link>

          <Link
            to="/social"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-[#00EC97]/20 text-[#00EC97] hover:bg-[#00EC97]/30 transition-colors mb-2',
            }}
          >
            <Users size={20} />
            <span className="font-medium">Social Methods</span>
          </Link>
        </nav>

        {accountId && (
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-white/50 mb-1">Connected as</div>
            <div className="font-mono text-sm truncate">{accountId}</div>
          </div>
        )}
      </aside>
    </>
  )
}

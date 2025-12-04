import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { BookOpen, Database, Github, Home, Menu, Users, X } from 'lucide-react';
import { Logo } from '../components/logo';
import { WalletButton } from '../components/wallet-button';
import { useWallet } from '../integrations/near-wallet';

export const Route = createFileRoute('/_layout')({
  component: LayoutComponent,
});

const GradientBlur = ({
  className,
  opacity = 'opacity-30',
}: {
  className: string;
  opacity?: string;
}) => (
  <div
    className={`absolute blur-[60px] pointer-events-none ${opacity} ${className}`}
  />
);

function LayoutComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { accountId } = useWallet();

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#0d1117] overflow-hidden">
      <GradientBlur className="top-[-100px] right-[5%] w-[200px] h-[350px] md:w-[244px] md:h-[401px] rounded-full rotate-[-62deg] [background:radial-gradient(50%_50%_at_78%_27%,rgba(0,236,151,0.8)_0%,rgba(61,127,255,0.6)_100%)]" />
      <GradientBlur className="top-[50px] right-[-50px] w-[250px] h-[500px] md:w-[301px] md:h-[705px] rounded-full rotate-[-19deg] [background:radial-gradient(50%_50%_at_78%_27%,rgba(61,127,255,0.8)_0%,rgba(0,236,151,0.4)_100%)]" />

      <header className="relative z-20 w-full border-b border-white/10 bg-[#0d1117]/80 backdrop-blur-md">
        <nav className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 md:gap-8">
              <Link to="/" className="flex items-center">
                <Logo />
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className="text-white/70 hover:text-white transition-colors font-medium flex items-center gap-2"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: 'text-[#00EC97]' }}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  to="/graph"
                  className="text-white/70 hover:text-white transition-colors font-medium flex items-center gap-2"
                  activeProps={{ className: 'text-[#00EC97]' }}
                >
                  <Database className="h-4 w-4" />
                  Graph
                </Link>
                <Link
                  to="/social"
                  className="text-white/70 hover:text-white transition-colors font-medium flex items-center gap-2"
                  activeProps={{ className: 'text-[#3D7FFF]' }}
                >
                  <Users className="h-4 w-4" />
                  Social
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://nearbuilders.github.io/near-social-js/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                aria-label="View Documentation"
              >
                <BookOpen size={20} />
              </a>
              <a
                href="https://github.com/NEARBuilders/near-social-js"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                aria-label="View on GitHub"
              >
                <Github size={20} />
              </a>
              <WalletButton />
              <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Logo />
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
            activeOptions={{ exact: true }}
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
                'flex items-center gap-3 p-3 rounded-lg bg-[#3D7FFF]/20 text-[#3D7FFF] hover:bg-[#3D7FFF]/30 transition-colors mb-2',
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

      <main className="relative z-10 flex-1 w-full">
        <GradientBlur className="top-[300px] left-[-100px] w-40 h-[300px] md:w-52 md:h-[376px] rounded-full rotate-[146deg] [background:radial-gradient(50%_50%_at_78%_27%,rgba(0,236,151,0.6)_0%,rgba(61,127,255,0.4)_100%)]" />
        <GradientBlur className="top-[100px] left-[-150px] w-[250px] h-[350px] md:w-[330px] md:h-[445px] rounded-full rotate-[176deg] [background:radial-gradient(50%_50%_at_78%_27%,rgba(61,127,255,0.6)_0%,rgba(0,236,151,0.3)_100%)]" />
        <Outlet />
      </main>

      {/* <footer className="relative z-10 w-full overflow-hidden py-8 md:py-10 lg:py-12 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
          <a
            href="https://github.com/NEARBuilders/near-social-js/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-xs md:text-sm tracking-tight underline hover:no-underline transition-all text-center md:text-left"
          >
            Have feedback or found an issue? Let us know!
          </a>

          <div className="text-white/40 text-sm text-center md:text-right">
            Built by{' '}
            <a
              href="https://github.com/NEARBuilders"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00EC97] hover:underline"
            >
              NEAR Builders
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

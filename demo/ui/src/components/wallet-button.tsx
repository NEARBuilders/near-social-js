import { useWallet } from '../integrations/near-wallet';
import { Button } from './ui/button';
import { Loader2, LogOut, Wallet } from 'lucide-react';

export function WalletButton() {
  const { accountId, isConnecting, connect, disconnect } = useWallet();

  if (isConnecting) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (accountId) {
    return (
      <div className="flex items-center gap-2 text-white">
        <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm font-mono">
          {accountId.length > 20
            ? `${accountId.slice(0, 8)}...${accountId.slice(-8)}`
            : accountId}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connect}
      className="gap-2 bg-[#00EC97] text-black hover:bg-[#00d084] font-semibold"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}

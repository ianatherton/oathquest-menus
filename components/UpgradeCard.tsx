interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  owned: number;
  currentCost: number;
  baseProduction?: number;
  clickBonus?: number;
  isOneTime: boolean;
}

interface UpgradeCardProps {
  upgrade: Upgrade;
  canAfford: boolean;
  onBuy: () => void;
}

export function UpgradeCard({ upgrade, canAfford, onBuy }: UpgradeCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return Math.floor(num).toLocaleString();
  };

  const isMaxed = upgrade.isOneTime && upgrade.owned > 0;

  return (
    <button
      onClick={onBuy}
      disabled={!canAfford || isMaxed}
      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
        isMaxed
          ? 'bg-green-900/30 border-green-500/50 cursor-not-allowed'
          : canAfford
          ? 'bg-blue-900/30 border-blue-400/50 hover:bg-blue-800/40 hover:border-blue-300/70'
          : 'bg-gray-900/30 border-gray-600/50 cursor-not-allowed opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{upgrade.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="flex items-center gap-2">
                <span>{upgrade.name}</span>
                {upgrade.owned > 0 && (
                  <span className="text-sm text-blue-300">×{upgrade.owned}</span>
                )}
              </div>
              <div className="text-sm text-gray-300">{upgrade.description}</div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="text-sm">
              {upgrade.baseProduction && (
                <span className="text-green-300">+{upgrade.baseProduction}/s</span>
              )}
              {upgrade.clickBonus && (
                <span className="text-yellow-300">+{upgrade.clickBonus}/click</span>
              )}
            </div>
            <div className={canAfford ? 'text-yellow-300' : 'text-gray-400'}>
              {isMaxed ? '✓ Owned' : `${formatNumber(upgrade.currentCost)} 💰`}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

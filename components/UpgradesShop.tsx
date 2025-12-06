import { UpgradeCard } from './UpgradeCard';

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

interface UpgradesShopProps {
  title: string;
  upgrades: Upgrade[];
  coins: number;
  onBuy: (upgradeId: string) => void;
}

export function UpgradesShop({ title, upgrades, coins, onBuy }: UpgradesShopProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h2 className="mb-4">{title}</h2>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {upgrades.map((upgrade) => (
          <UpgradeCard
            key={upgrade.id}
            upgrade={upgrade}
            canAfford={coins >= upgrade.currentCost}
            onBuy={() => onBuy(upgrade.id)}
          />
        ))}
      </div>
    </div>
  );
}

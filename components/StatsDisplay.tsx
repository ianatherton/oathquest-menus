import { formatNumber } from '../utils/formatNumber';

interface StatsDisplayProps {
  coins: number;
  coinsPerSecond: number;
  totalClicks: number;
  clickValue: number;
}

export function StatsDisplay({
  coins,
  coinsPerSecond,
  totalClicks,
  clickValue,
}: StatsDisplayProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-2">💰</div>
          <div className="text-4xl mb-1">{formatNumber(coins)}</div>
          <div className="text-sm text-purple-200">Coins</div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl mb-1">{formatNumber(coinsPerSecond)}</div>
            <div className="text-xs text-purple-200">per second</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">{formatNumber(clickValue)}</div>
            <div className="text-xs text-purple-200">per click</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">{formatNumber(totalClicks)}</div>
            <div className="text-xs text-purple-200">total clicks</div>
          </div>
        </div>
      </div>
    </div>
  );
}
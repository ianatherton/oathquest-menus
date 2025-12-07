import { Heart, Plus, Brain, Coins, Trophy } from 'lucide-react';
import { Oath } from '../App';
import { formatNumber } from '../utils/formatNumber';

interface OathCardProps {
  oath: Oath;
  onClick: () => void;
}

export function OathCard({ oath, onClick }: OathCardProps) {
  const isComplete = oath.endDate ? Date.now() > oath.endDate : false;

  const getTimeElapsed = () => {
    const now = Date.now();
    const elapsed = now - oath.startDate;
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 group hover:scale-[1.02] transition-transform ${isComplete ? 'relative' : ''}`}
    >
      {/* Glow effect for completed oaths */}
      {isComplete && (
        <div className="absolute inset-0 btn-shine rounded-2xl opacity-30 pointer-events-none" />
      )}

      {/* Icon */}
      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center flex-shrink-0 shadow-lg ${
        isComplete ? 'bg-green-600 border-green-400' : 'bg-gray-900 border-yellow-500'
      }`}>
        <span className="text-2xl">{isComplete ? '🏆' : '🛡️'}</span>
      </div>

      {/* Habit name */}
      <div className={`px-6 py-3 rounded-r-full border-4 border-black shadow-lg transition-colors flex-shrink-0 ${
        isComplete ? 'btn-shine group-hover:brightness-110' : 'bg-yellow-300 group-hover:bg-yellow-200'
      }`}>
        <span className="text-black flex items-center gap-2">
          {isComplete && <Trophy className="w-4 h-4" />}
          {isComplete ? '✨' : '🕐'} {oath.habit} for {getTimeElapsed()}
        </span>
      </div>

      {/* Currencies */}
      <div className="flex gap-2 flex-1">
        {/* Willpower */}
        <div className="bg-red-400 px-4 py-3 rounded-xl border-4 border-black shadow-lg flex items-center gap-2 flex-1">
          <Heart className="w-6 h-6 text-red-900 fill-red-900" />
          <span className="text-black">{formatNumber(oath.currencies.willpower)}</span>
        </div>

        {/* Wellness */}
        <div className="bg-green-400 px-4 py-3 rounded-xl border-4 border-black shadow-lg flex items-center gap-2 flex-1">
          <Plus className="w-6 h-6 text-green-900" />
          <span className="text-black">{formatNumber(oath.currencies.wellness)}</span>
        </div>

        {/* Wisdom */}
        <div className="bg-blue-400 px-4 py-3 rounded-xl border-4 border-black shadow-lg flex items-center gap-2 flex-1">
          <Brain className="w-6 h-6 text-blue-900" />
          <span className="text-black">{formatNumber(oath.currencies.wisdom)}</span>
        </div>

        {/* Gold */}
        <div className="bg-yellow-400 px-4 py-3 rounded-xl border-4 border-black shadow-lg flex items-center gap-2 flex-1">
          <Coins className="w-6 h-6 text-yellow-900" />
          <span className="text-black">{formatNumber(oath.currencies.gold)}</span>
        </div>
      </div>
    </button>
  );
}
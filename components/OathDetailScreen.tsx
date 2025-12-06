import { ArrowLeft, Heart, Plus, Brain, Coins, Trash2 } from 'lucide-react';
import { Oath } from '../App';
import { CurrencyCard } from './CurrencyCard';

interface OathDetailScreenProps {
  oath: Oath;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function OathDetailScreen({ oath, onBack, onDelete }: OathDetailScreenProps) {
  const getTimeElapsed = () => {
    const now = Date.now();
    const elapsed = now - oath.startDate;
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const getTimeRemaining = () => {
    if (!oath.endDate) return null;
    const now = Date.now();
    const remaining = oath.endDate - now;
    if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const elapsed = getTimeElapsed();
  const remaining = getTimeRemaining();

  const handleDelete = () => {
    if (confirm('Are you sure you want to break this oath? All progress will be lost.')) {
      onDelete(oath.id);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ 
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0px, rgba(139, 92, 246, 0.3) 40px, rgba(126, 34, 206, 0.3) 40px, rgba(126, 34, 206, 0.3) 80px)',
      backgroundColor: '#7e22ce'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="bg-purple-900 p-4 rounded-full border-4 border-purple-950 hover:bg-purple-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="bg-yellow-400 text-black px-8 py-4 rounded-xl border-4 border-black shadow-lg flex-1 text-center">
            <span>{oath.habit}</span>
          </div>
        </div>

        {/* Oath Info */}
        <div className="bg-purple-900/70 border-4 border-purple-950 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <div className="text-white/60 text-sm mb-2">Time Kept</div>
              <div className="text-white text-4xl">
                {elapsed.days}d {elapsed.hours}h {elapsed.minutes}m {elapsed.seconds}s
              </div>
            </div>
            {remaining && (
              <div className="text-center flex-1 border-l-4 border-purple-950">
                <div className="text-white/60 text-sm mb-2">Time Remaining</div>
                <div className="text-white text-4xl">
                  {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
                </div>
              </div>
            )}
          </div>
          <div className="text-center text-white/80">
            <p className="mb-1">I stopped {oath.habit}</p>
            <p>Started: {new Date(oath.startDate).toLocaleString()}</p>
            {oath.endDate && <p>Ends: {new Date(oath.endDate).toLocaleString()}</p>}
          </div>
        </div>

        {/* Sacred Currencies Title */}
        <div className="bg-yellow-400 text-black px-6 py-3 rounded-xl border-4 border-black inline-block mb-6">
          <span>Sacred Currencies</span>
        </div>

        {/* Currencies Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <CurrencyCard
            name="Willpower"
            icon={<Heart className="w-12 h-12 text-red-900 fill-red-900" />}
            value={oath.currencies.willpower}
            color="red"
            description="Your inner strength grows with each passing hour"
          />
          <CurrencyCard
            name="Wellness"
            icon={<Plus className="w-12 h-12 text-green-900" />}
            value={oath.currencies.wellness}
            color="green"
            description="Your body heals and improves over time"
          />
          <CurrencyCard
            name="Wisdom"
            icon={<Brain className="w-12 h-12 text-blue-900" />}
            value={oath.currencies.wisdom}
            color="blue"
            description="Knowledge and insight accumulate with persistence"
          />
          <CurrencyCard
            name="Gold"
            icon={<Coins className="w-12 h-12 text-yellow-900" />}
            value={oath.currencies.gold}
            color="yellow"
            description="The treasure of accomplishment and self-discipline"
          />
        </div>

        {/* Break Oath Button */}
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl border-4 border-black shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          <span>Break Oath (Delete)</span>
        </button>
      </div>
    </div>
  );
}

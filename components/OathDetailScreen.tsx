import { useState } from 'react';
import { ArrowLeft, Heart, Leaf, Brain, Trash2, Trophy, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Oath } from '../App';
import { CurrencyCard } from './CurrencyCard';
import { generateOathHash } from '../utils/oathHash';

interface OathDetailScreenProps {
  oath: Oath;
  onBack: () => void;
  onDelete: (id: string) => void;
  onComplete: (oath: Oath) => void;
}

export function OathDetailScreen({ oath, onBack, onDelete, onComplete }: OathDetailScreenProps) {
  const [showHash, setShowHash] = useState(false);
  const [copied, setCopied] = useState(false);

  const oathLength = oath.length ?? (oath.endDate ? Math.round((oath.endDate - oath.startDate) / (24 * 60 * 60 * 1000)) : 'forever'); // fallback for old oaths

  const oathHash = generateOathHash({
    habit: oath.habit,
    preface: oath.preface,
    badge: oath.badge || '🛡️',
    startDate: oath.startDate,
    length: oathLength,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(oathHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, isComplete: false };
  };

  const getBonusTime = () => { // time elapsed since oath.endDate
    if (!oath.endDate) return null;
    const now = Date.now();
    const bonus = now - oath.endDate;
    if (bonus <= 0) return null;
    const days = Math.floor(bonus / (1000 * 60 * 60 * 24));
    const hours = Math.floor((bonus % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((bonus % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((bonus % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const elapsed = getTimeElapsed();
  const remaining = getTimeRemaining();
  const bonusTime = getBonusTime();
  const isComplete = remaining?.isComplete ?? false;

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
            <span><span className="text-[1.5em]">{oath.preface === 'stop' ? '🛑' : '🚀'}</span> {oath.habit}</span>
          </div>
        </div>

        {/* Oath Info */}
        <div className="relative">
          {/* Large oath icon - overlapping behind */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-0">
            <span className="text-[8rem] drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] opacity-90">
              {oath.badge || '🛡️'}
            </span>
          </div>
        <div className="bg-purple-900/70 border-4 border-purple-950 rounded-xl p-8 mb-8 relative z-10 mt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <div className="text-white/60 text-sm mb-2">Time Kept</div>
              <div className="text-white text-4xl">
                {elapsed.days}d {elapsed.hours}h {elapsed.minutes}m {elapsed.seconds}s
              </div>
            </div>
            {remaining && (
              <div className="text-center flex-1 border-l-4 border-purple-950">
                <div className={`text-sm mb-2 ${isComplete ? 'text-glow-green' : 'text-white/60'}`}>
                  {isComplete ? '✨ Bonus Time ✨' : 'Time Remaining'}
                </div>
                <div className={`text-4xl ${isComplete ? 'text-glow-green' : 'text-white'}`}>
                  {isComplete && bonusTime
                    ? `+${bonusTime.days}d ${bonusTime.hours}h ${bonusTime.minutes}m ${bonusTime.seconds}s` 
                    : `${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`}
                </div>
              </div>
            )}
          </div>
          <div className="text-center text-white/80">
            <p className="mb-1">I {oath.preface === 'stop' ? 'stopped' : 'started'} {oath.habit}</p>
            <p>Since: {new Date(oath.startDate).toLocaleString()}</p>
            {oath.endDate && <p>Ends: {new Date(oath.endDate).toLocaleString()}</p>}
          </div>
        </div>
        </div>

        {/* Sacred Currencies Title + Complete Button */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="bg-yellow-400 text-black px-6 py-3 rounded-xl border-4 border-black inline-block">
            <span>Sacred Currencies</span>
          </div>
          {isComplete && (
            <button
              onClick={() => onComplete(oath)}
              className="btn-shine text-black px-6 py-3 rounded-xl border-4 border-black shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Complete - Oath Upheld</span>
            </button>
          )}
        </div>

        {/* Currencies Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <CurrencyCard
            name="Willpower"
            icon={<Heart className="w-12 h-12 text-red-900 fill-red-900" />}
            value={oath.currencies.willpower}
            color="red"
            description="Your inner strength grows with each passing second"
            particleSymbol="❤️"
            particleSpeed="fast"
          />
          <CurrencyCard
            name="Wellness"
            icon={<Leaf className="w-12 h-12 text-green-900" />}
            value={oath.currencies.wellness}
            color="green"
            description="Your body heals and improves over time"
            particleSymbol="🌿"
            particleSpeed="medium"
          />
          <CurrencyCard
            name="Wisdom"
            icon={<Brain className="w-12 h-12 text-blue-900" />}
            value={oath.currencies.wisdom}
            color="blue"
            description="Knowledge and insight accumulate with persistence"
            particleSymbol="🧠"
            particleSpeed="slow"
          />
          <CurrencyCard
            name="Renewal"
            icon={<span className="text-5xl">🦋</span>}
            value={oath.currencies.gold}
            color="yellow"
            description="The transformation that comes from lasting change"
            particleSymbol="🦋"
            particleSpeed="slow"
          />
        </div>

        {/* Sync Hash Section */}
        <div className="bg-purple-900/50 border-4 border-purple-950 rounded-xl mb-8">
          <button
            onClick={() => setShowHash(!showHash)}
            className="w-full px-6 py-4 flex items-center justify-between text-white hover:bg-purple-800/30 transition-colors rounded-xl"
          >
            <span className="text-white/80">Sync Hash</span>
            {showHash ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {showHash && (
            <div className="px-6 pb-6 space-y-3">
              <p className="text-white/60 text-sm">Use this hash to track this oath on another device</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg text-white/90 text-sm break-all font-mono">
                  {oathHash}
                </code>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-3 rounded-lg border-2 border-black transition-colors flex items-center gap-2 ${
                    copied ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black hover:bg-yellow-300'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Break Oath Button - hidden when oath is complete */}
        {!isComplete && (
          <button
            onClick={handleDelete}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl border-4 border-black shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Break Oath (Delete)</span>
          </button>
        )}
      </div>
    </div>
  );
}

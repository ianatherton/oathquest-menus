import { useState, useEffect, useRef } from 'react';
import { Heart, Leaf, Brain, Trophy } from 'lucide-react';
import { Oath } from '../App';
import { formatNumber } from '../utils/formatNumber';

interface OathCardProps {
  oath: Oath;
  onClick: () => void;
}

interface Particle {
  id: number;
  type: 'willpower' | 'wellness' | 'wisdom' | 'gold';
  rotateDir: number;
  rotateEnd: number;
}

const PARTICLE_CONFIG = {
  willpower: { symbol: '❤️', speed: 'fast', duration: 700 },
  wellness: { symbol: '🌿', speed: 'medium', duration: 1500 },
  wisdom: { symbol: '🧠', speed: 'slow', duration: 3000 },
  gold: { symbol: '🦋', speed: 'slow', duration: 3000 },
} as const;

export function OathCard({ oath, onClick }: OathCardProps) {
  const isComplete = oath.endDate ? Date.now() > oath.endDate : false;
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevValuesRef = useRef({
    willpower: Math.floor(oath.currencies.willpower),
    wellness: Math.floor(oath.currencies.wellness),
    wisdom: Math.floor(oath.currencies.wisdom),
    gold: Math.floor(oath.currencies.gold),
  });
  const particleIdRef = useRef(0);

  useEffect(() => {
    const currencies = ['willpower', 'wellness', 'wisdom', 'gold'] as const;
    currencies.forEach(type => {
      const current = Math.floor(oath.currencies[type]);
      const prev = prevValuesRef.current[type];
      if (current > prev) {
        const id = particleIdRef.current++;
        const rotateDir = (Math.random() - 0.5) * 40;
        const rotateEnd = (Math.random() - 0.5) * 30;
        setParticles(p => [...p, { id, type, rotateDir, rotateEnd }]);
        setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), PARTICLE_CONFIG[type].duration);
      }
      prevValuesRef.current[type] = current;
    });
  }, [oath.currencies]);

  const getTimeElapsed = () => {
    const now = Date.now();
    const elapsed = now - oath.startDate;
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const renderCurrencyBox = (type: 'willpower' | 'wellness' | 'wisdom' | 'gold', bgColor: string, icon: React.ReactNode, value: number) => {
    const typeParticles = particles.filter(p => p.type === type);
    return (
      <div className={`${bgColor} px-2 py-2 md:px-4 md:py-3 rounded-xl border-2 md:border-4 border-black shadow-lg flex items-center gap-1 md:gap-2 flex-1 relative overflow-hidden`}>
        {icon}
        <span className="text-black text-xs md:text-base">{formatNumber(value)}</span>
        {typeParticles.map(p => (
          <span 
            key={p.id} 
            className={`absolute left-1 top-0 text-xs md:text-sm particle-${PARTICLE_CONFIG[type].speed}`}
            style={{
              '--rotate-dir': `${p.rotateDir}deg`,
              '--rotate-end': `${p.rotateEnd}deg`,
            } as React.CSSProperties}
          >
            {PARTICLE_CONFIG[type].symbol}
          </span>
        ))}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className={`w-full group hover:scale-[1.02] transition-transform ${isComplete ? 'relative' : ''}`}
    >
      {/* Glow effect for completed oaths */}
      {isComplete && (
        <div className="absolute inset-0 btn-shine rounded-2xl opacity-30 pointer-events-none" />
      )}

      {/* Top row: Icon + Habit name */}
      <div className="flex items-center gap-2">
        {/* Icon */}
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-4 flex items-center justify-center flex-shrink-0 shadow-lg ${
          isComplete ? 'bg-green-600 border-green-400' : 'bg-gray-900 border-yellow-500'
        }`}>
          <span className="text-xl md:text-2xl">{isComplete ? '🏆' : (oath.badge || '🛡️')}</span>
        </div>

        {/* Habit name */}
        <div className={`px-4 md:px-6 py-2 md:py-3 rounded-r-full border-4 border-black shadow-lg transition-colors flex-shrink-0 ${
          isComplete ? 'btn-shine group-hover:brightness-110' : 'bg-yellow-300 group-hover:bg-yellow-200'
        }`}>
<span className="text-black flex items-center gap-2 text-sm md:text-base">
          {isComplete && <Trophy className="w-4 h-4" />}
          {isComplete ? '✨' : (
            <span className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded border-2 text-xs md:text-sm ${
              oath.preface === 'stop' ? 'border-red-600 bg-red-100' : 'border-green-600 bg-green-100'
            }`}>
              <span className="text-[1.5em] drop-shadow-md">{oath.preface === 'stop' ? '🛑' : '🚀'}</span>
            </span>
          )} {oath.preface === 'stop' ? 'Stop' : 'Start'} {oath.habit} for {getTimeElapsed()}
        </span>
        </div>

        {/* Currencies - desktop only (inline) */}
        <div className="hidden lg:flex gap-2 flex-1">
          {renderCurrencyBox('willpower', 'bg-red-400', <Heart className="w-6 h-6 text-red-900 fill-red-900" />, oath.currencies.willpower)}
          {renderCurrencyBox('wellness', 'bg-green-400', <Leaf className="w-6 h-6 text-green-900" />, oath.currencies.wellness)}
          {renderCurrencyBox('wisdom', 'bg-blue-400', <Brain className="w-6 h-6 text-blue-900" />, oath.currencies.wisdom)}
          {renderCurrencyBox('gold', 'bg-yellow-400', <span className="text-xl">🦋</span>, oath.currencies.gold)}
        </div>
      </div>

      {/* Currencies - mobile/tablet (second row) */}
      <div className="flex lg:hidden gap-2 mt-2 ml-14 md:ml-18">
        {renderCurrencyBox('willpower', 'bg-red-400', <Heart className="w-5 h-5 text-red-900 fill-red-900" />, oath.currencies.willpower)}
        {renderCurrencyBox('wellness', 'bg-green-400', <Leaf className="w-5 h-5 text-green-900" />, oath.currencies.wellness)}
        {renderCurrencyBox('wisdom', 'bg-blue-400', <Brain className="w-5 h-5 text-blue-900" />, oath.currencies.wisdom)}
        {renderCurrencyBox('gold', 'bg-yellow-400', <span className="text-lg">🦋</span>, oath.currencies.gold)}
      </div>
    </button>
  );
}
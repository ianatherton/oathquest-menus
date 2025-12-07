import { ArrowLeft, Heart, Leaf, Brain, Coins, Trophy } from 'lucide-react';
import { Trophy as TrophyType } from '../App';
import { formatNumber } from '../utils/formatNumber';

interface OathHallaProps {
  trophies: TrophyType[];
  onBack: () => void;
}

export function OathHalla({ trophies, onBack }: OathHallaProps) {
  return (
    <div className="min-h-screen p-6" style={{ 
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(234, 179, 8, 0.15) 0px, rgba(234, 179, 8, 0.15) 40px, rgba(202, 138, 4, 0.15) 40px, rgba(202, 138, 4, 0.15) 80px)',
      backgroundColor: '#713f12'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="bg-yellow-900 p-4 rounded-full border-4 border-yellow-950 hover:bg-yellow-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-yellow-200" />
          </button>
          <div className="bg-yellow-400 text-black px-8 py-4 rounded-xl border-4 border-black shadow-lg flex-1 text-center flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-800" />
            <span className="text-2xl font-bold">Oath-Halla</span>
            <Trophy className="w-8 h-8 text-yellow-800" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-yellow-200 text-center mb-8 text-lg">
          The Hall of Honored Oaths — Where Legends Rest
        </p>

        {/* Trophies List */}
        {trophies.length === 0 ? (
          <div className="bg-yellow-900/50 border-4 border-yellow-950 rounded-xl p-12 text-center">
            <div className="w-48 h-48 mx-auto mb-6 relative">
              <img src="/ui_scroll.png" alt="Empty scroll" className="w-full h-full object-contain opacity-50" />
            </div>
            <p className="text-xl text-yellow-200 mb-2">The halls are empty...</p>
            <p className="text-yellow-400">Complete your first oath to earn a trophy!</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {trophies.map((trophy, index) => (
              <div 
                key={trophy.id} 
                className="relative bg-yellow-900/60 border-4 border-yellow-700 rounded-xl p-6 hover:bg-yellow-900/80 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Scroll decoration */}
                <div className="absolute -left-4 -top-4 w-16 h-16">
                  <img src="/ui_scroll.png" alt="" className="w-full h-full object-contain" />
                </div>

                {/* Trophy content */}
                <div className="ml-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl text-yellow-100 font-bold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        {trophy.preface === 'stop' ? 'Stopped' : 'Started'} {trophy.habit}
                      </h3>
                      <p className="text-yellow-400 text-sm">
                        Completed: {new Date(trophy.completedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg border-2 border-black font-bold">
                      {trophy.totalDays} days
                    </div>
                  </div>

                  {/* Final currencies */}
                  <div className="flex gap-3 flex-wrap">
                    <div className="bg-red-400/80 px-3 py-2 rounded-lg border-2 border-black flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-900 fill-red-900" />
                      <span className="text-black text-sm">{formatNumber(trophy.finalCurrencies.willpower)}</span>
                    </div>
                    <div className="bg-green-400/80 px-3 py-2 rounded-lg border-2 border-black flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-900" />
                      <span className="text-black text-sm">{formatNumber(trophy.finalCurrencies.wellness)}</span>
                    </div>
                    <div className="bg-blue-400/80 px-3 py-2 rounded-lg border-2 border-black flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-900" />
                      <span className="text-black text-sm">{formatNumber(trophy.finalCurrencies.wisdom)}</span>
                    </div>
                    <div className="bg-yellow-400/80 px-3 py-2 rounded-lg border-2 border-black flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-900" />
                      <span className="text-black text-sm">{formatNumber(trophy.finalCurrencies.gold)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trophy count footer */}
        {trophies.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-yellow-300">
              🏆 {trophies.length} {trophies.length === 1 ? 'Trophy' : 'Trophies'} Earned 🏆
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


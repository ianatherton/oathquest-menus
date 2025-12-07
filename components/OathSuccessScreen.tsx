import { Heart, Plus, Brain, Coins, Trophy, Home, ScrollText } from 'lucide-react';
import { Oath } from '../App';
import { formatNumber } from '../utils/formatNumber';

interface OathSuccessScreenProps {
  oath: Oath;
  onContinue: () => void;
  onViewHalla: () => void;
}

export function OathSuccessScreen({ oath, onContinue, onViewHalla }: OathSuccessScreenProps) {
  const totalDays = Math.floor((Date.now() - oath.startDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen p-6 flex items-center justify-center" style={{ 
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0px, rgba(34, 197, 94, 0.2) 40px, rgba(22, 163, 74, 0.2) 40px, rgba(22, 163, 74, 0.2) 80px)',
      backgroundColor: '#166534'
    }}>
      <div className="max-w-2xl mx-auto text-center">
        {/* Trophy Icon */}
        <div className="trophy-float mb-8">
          <div className="w-32 h-32 mx-auto bg-yellow-400 rounded-full border-8 border-yellow-600 flex items-center justify-center shadow-2xl">
            <Trophy className="w-16 h-16 text-yellow-800" />
          </div>
        </div>

        {/* Success Title */}
        <h1 className="text-5xl text-white mb-4 text-glow-green">
          🎉 Oath Upheld! 🎉
        </h1>
        <p className="text-2xl text-green-200 mb-8">
          You have proven your resolve
        </p>

        {/* Summary Card */}
        <div className="bg-green-900/70 border-4 border-green-950 rounded-xl p-8 mb-8">
          <div className="bg-yellow-400 text-black px-6 py-3 rounded-xl border-4 border-black inline-block mb-6">
            <span className="text-xl">{oath.habit}</span>
          </div>
          
          <div className="text-white text-xl mb-6">
            <p>You kept this oath for <span className="text-glow-green font-bold">{totalDays} days</span></p>
            <p className="text-green-300 text-sm mt-2">
              Started: {new Date(oath.startDate).toLocaleDateString()}
            </p>
          </div>

          {/* Final Currencies */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-400 p-4 rounded-xl border-4 border-black">
              <Heart className="w-8 h-8 text-red-900 fill-red-900 mx-auto mb-2" />
              <div className="text-black font-bold">{formatNumber(oath.currencies.willpower)}</div>
              <div className="text-red-900 text-xs">Willpower</div>
            </div>
            <div className="bg-green-400 p-4 rounded-xl border-4 border-black">
              <Plus className="w-8 h-8 text-green-900 mx-auto mb-2" />
              <div className="text-black font-bold">{formatNumber(oath.currencies.wellness)}</div>
              <div className="text-green-900 text-xs">Wellness</div>
            </div>
            <div className="bg-blue-400 p-4 rounded-xl border-4 border-black">
              <Brain className="w-8 h-8 text-blue-900 mx-auto mb-2" />
              <div className="text-black font-bold">{formatNumber(oath.currencies.wisdom)}</div>
              <div className="text-blue-900 text-xs">Wisdom</div>
            </div>
            <div className="bg-yellow-400 p-4 rounded-xl border-4 border-black">
              <Coins className="w-8 h-8 text-yellow-900 mx-auto mb-2" />
              <div className="text-black font-bold">{formatNumber(oath.currencies.gold)}</div>
              <div className="text-yellow-900 text-xs">Gold</div>
            </div>
          </div>
        </div>

        {/* Trophy Saved Notice */}
        <div className="bg-yellow-100 border-4 border-yellow-600 rounded-xl p-4 mb-8 rotate-[-1deg]">
          <p className="text-yellow-900 flex items-center justify-center gap-2">
            <ScrollText className="w-5 h-5" />
            <span>A trophy has been saved to <strong>Oath-Halla</strong>!</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={onContinue}
            className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-xl border-4 border-black shadow-lg transition-colors flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Continue</span>
          </button>
          <button
            onClick={onViewHalla}
            className="btn-shine text-black px-8 py-4 rounded-xl border-4 border-black shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            <span>View Oath-Halla</span>
          </button>
        </div>
      </div>
    </div>
  );
}


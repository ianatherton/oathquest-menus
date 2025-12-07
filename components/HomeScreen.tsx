import { Plus, Trophy } from 'lucide-react';
import { Oath } from '../App';
import { OathCard } from './OathCard';

interface HomeScreenProps {
  oaths: Oath[];
  trophyCount: number;
  onNewOath: () => void;
  onSelectOath: (id: string) => void;
  onOpenHalla: () => void;
}

export function HomeScreen({ oaths, trophyCount, onNewOath, onSelectOath, onOpenHalla }: HomeScreenProps) {
  return (
    <div className="min-h-screen p-6" style={{ 
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0px, rgba(139, 92, 246, 0.3) 40px, rgba(126, 34, 206, 0.3) 40px, rgba(126, 34, 206, 0.3) 80px)',
      backgroundColor: '#7e22ce'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <button
            onClick={onNewOath}
            className="bg-yellow-400 text-black px-8 py-4 rounded-xl border-4 border-black shadow-lg hover:bg-yellow-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus size={24} />
              <span>New Oath</span>
            </div>
          </button>
          <button
            onClick={onOpenHalla}
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-4 rounded-xl border-4 border-black shadow-lg transition-colors flex items-center gap-2"
          >
            <Trophy size={24} />
            <span>Oath-Halla</span>
            {trophyCount > 0 && (
              <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-sm font-bold">
                {trophyCount}
              </span>
            )}
          </button>
        </div>

        {/* Active OathQuests */}
        <div className="bg-yellow-400 text-black px-6 py-3 rounded-xl border-4 border-black inline-block mb-6">
          <span>Active OathQuests</span>
        </div>

        {/* Oaths List */}
        <div className="space-y-4">
          {oaths.length === 0 ? (
            <div className="bg-purple-900/50 border-4 border-purple-950 rounded-xl p-12 text-center text-white">
              <div className="text-6xl mb-4">📜</div>
              <p className="text-xl mb-2">No active oaths yet</p>
              <p className="text-purple-200">Create your first oath to begin your journey!</p>
            </div>
          ) : (
            oaths.map((oath) => (
              <OathCard key={oath.id} oath={oath} onClick={() => onSelectOath(oath.id)} />
            ))
          )}
        </div>

        {/* Info note */}
        {oaths.length > 0 && (
          <div className="mt-8 bg-white/90 p-4 rounded-lg border-2 border-black rotate-[-2deg] max-w-xs shadow-lg">
            <p className="text-xs text-black leading-relaxed">
              Each oath tracks your progress with 4 sacred currencies: Willpower, Wellness, Wisdom, and Gold. 
              The longer you keep your oath, the more you earn!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

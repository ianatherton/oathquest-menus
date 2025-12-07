import { useState, useEffect } from 'react';
import { Plus, Trophy, HelpCircle } from 'lucide-react';
import { Oath } from '../App';
import { OathCard } from './OathCard';
import { AppInfoModal } from './AppInfoModal';

const FIRST_VISIT_KEY = 'oathquest_seen_info'; // same key as AppInfoModal

interface HomeScreenProps {
  oaths: Oath[];
  onNewOath: () => void;
  onSelectOath: (id: string) => void;
  onOpenHalla: () => void;
}

export function HomeScreen({ oaths, onNewOath, onSelectOath, onOpenHalla }: HomeScreenProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    setIsFirstVisit(!localStorage.getItem(FIRST_VISIT_KEY));
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ 
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0px, rgba(139, 92, 246, 0.3) 40px, rgba(126, 34, 206, 0.3) 40px, rgba(126, 34, 206, 0.3) 80px)',
      backgroundColor: '#7e22ce'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
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
              onClick={() => setShowWelcomeModal(true)}
              className={isFirstVisit 
                ? "btn-shine bg-purple-600 text-white p-4 rounded-full border-4 border-purple-950 hover:bg-purple-500 transition-colors"
                : "bg-yellow-400 text-black p-4 rounded-full border-4 border-black shadow-lg hover:bg-yellow-300 transition-colors"
              }
              title="Welcome Guide"
            >
              <HelpCircle size={24} />
            </button>
          </div>
          <button
            onClick={onOpenHalla}
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-4 rounded-xl border-4 border-black shadow-lg transition-colors flex items-center gap-2"
          >
            <Trophy size={24} />
            <span>Oath-Halla</span>
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
            [...oaths].reverse().map((oath) => (
              <OathCard key={oath.id} oath={oath} onClick={() => onSelectOath(oath.id)} />
            ))
          )}
        </div>

        {/* Info note */}
        {oaths.length > 0 && (
          <div className="mt-8 bg-white/90 p-4 rounded-lg border-2 border-black rotate-[-2deg] max-w-xs shadow-lg">
            <p className="text-xs text-black leading-relaxed">
              Each oath tracks your progress with 4 sacred currencies: Willpower, Wellness, Wisdom, and Renewal. 
              The longer you keep your oath, the more you earn!
            </p>
          </div>
        )}

        {/* Welcome Modal */}
        {showWelcomeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-2xl w-full">
              {/* Scroll background */}
              <div className="absolute inset-0 bg-repeat bg-center bg-contain opacity-20" style={{
                backgroundImage: 'url(/ui_scroll.png)'
              }}></div>

              <div className="relative bg-gradient-to-b from-purple-900 to-purple-950 border-4 border-yellow-400 rounded-2xl p-8 shadow-2xl">
                {/* Close button */}
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="absolute top-4 right-4 text-white hover:text-yellow-400 transition-colors"
                >
                  ✕
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4 animate-pulse">🕯️</div>
                  <h2 className="text-yellow-400 text-3xl font-bold mb-2">The First Oath</h2>
                  <h1 className="text-white text-4xl font-bold">Welcome to your own mind.</h1>
                </div>

                {/* Body */}
                <div className="text-white text-lg leading-relaxed space-y-4 mb-8">
                  <p>This isn't just a game about numbers going up. It's a mirror for where you are right now.</p>
                  <p>Whatever habit brought you here—whether you want to start it or break it—this space is private. No social leaderboards. No judgment. Just you and the raw data of your own choices.</p>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowWelcomeModal(false);
                      onNewOath();
                    }}
                    className="bg-yellow-400 text-black px-8 py-4 rounded-xl border-4 border-black shadow-lg hover:bg-yellow-300 transition-colors text-lg font-semibold"
                  >
                    I'm ready to be honest.
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* App Info Footer */}
        <div className="mt-12 flex justify-center">
          <AppInfoModal />
        </div>
      </div>
    </div>
  );
}

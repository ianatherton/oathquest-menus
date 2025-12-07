import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { NewOathScreen } from './components/NewOathScreen';
import { OathDetailScreen } from './components/OathDetailScreen';
import { OathSealedModal } from './components/OathSealedModal';
import { OathSuccessScreen } from './components/OathSuccessScreen';
import { OathHalla } from './components/OathHalla';

export interface Oath {
  id: string;
  habit: string;
  preface: 'stop' | 'start';
  startDate: number;
  endDate?: number; // undefined means "forever"
  length: 'forever' | number; // number of days
  startTime: string;
  currencies: {
    willpower: number;
    wellness: number;
    wisdom: number;
    gold: number;
  };
  lastUpdated: number;
}

export interface Trophy {
  id: string;
  habit: string;
  preface: 'stop' | 'start';
  startDate: number;
  completedDate: number;
  totalDays: number;
  finalCurrencies: {
    willpower: number;
    wellness: number;
    wisdom: number;
    gold: number;
  };
}

type Screen = 'home' | 'new-oath' | 'oath-detail' | 'oath-success' | 'oath-halla';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedOathId, setSelectedOathId] = useState<string | null>(null);
  const [oaths, setOaths] = useState<Oath[]>(() => {
    const saved = localStorage.getItem('oathsData');
    return saved ? JSON.parse(saved) : [];
  });
  const [trophies, setTrophies] = useState<Trophy[]>(() => {
    const saved = localStorage.getItem('oathTrophies');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSealedModal, setShowSealedModal] = useState(false);
  const [newOath, setNewOath] = useState<Oath | null>(null);
  const [completedOath, setCompletedOath] = useState<Oath | null>(null);

  useEffect(() => {
    localStorage.setItem('oathsData', JSON.stringify(oaths));
  }, [oaths]);

  useEffect(() => {
    localStorage.setItem('oathTrophies', JSON.stringify(trophies));
  }, [trophies]);

  // Update currencies for all oaths based on time elapsed
  useEffect(() => {
    const interval = setInterval(() => {
      setOaths((prevOaths) =>
        prevOaths.map((oath) => {
          const now = Date.now();
          const timeSinceLastUpdate = (now - oath.lastUpdated) / 1000; // seconds

          // Calculate currency gains based on time
          // Tier 1: Willpower increases every second
          // Tier 2: Wellness increases every 6 seconds
          // Tier 3: Wisdom increases every minute (60 seconds)
          // Tier 4: Gold increases every 10 minutes (600 seconds)
          return {
            ...oath,
            currencies: {
              willpower: oath.currencies.willpower + timeSinceLastUpdate,
              wellness: oath.currencies.wellness + (timeSinceLastUpdate / 6),
              wisdom: oath.currencies.wisdom + (timeSinceLastUpdate / 60),
              gold: oath.currencies.gold + (timeSinceLastUpdate / 600),
            },
            lastUpdated: now,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateOath = (habit: string, preface: 'stop' | 'start', length: 'forever' | number, startTime: string) => {
    const now = Date.now();
    let startDate: number;
    let initialCurrencies = {
      willpower: 0,
      wellness: 0,
      wisdom: 0,
      gold: 0,
    };

    if (startTime === 'now') {
      startDate = now;
    } else {
      // Parse the past date/time - format: "2024-12-03 3:30 PM"
      const parts = startTime.split(' ');
      const dateStr = parts[0];
      const timeStr = parts[1];
      const ampmStr = parts[2];
      const [hourStr, minuteStr] = timeStr.split(':');
      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      
      let hour24 = hour;
      if (ampmStr === 'PM' && hour !== 12) hour24 = hour + 12;
      if (ampmStr === 'AM' && hour === 12) hour24 = 0;
      
      const [year, month, day] = dateStr.split('-').map(Number);
      const pastDate = new Date(year, month - 1, day, hour24, minute);
      startDate = pastDate.getTime();

      // Calculate elapsed time in seconds
      const elapsedSeconds = (now - startDate) / 1000;

      // Calculate initial currencies based on elapsed time
      initialCurrencies = {
        willpower: elapsedSeconds, // +1 per second
        wellness: elapsedSeconds / 6, // +1 per 6 seconds
        wisdom: elapsedSeconds / 60, // +1 per minute
        gold: elapsedSeconds / 600, // +1 per 10 minutes
      };
    }

    const oath: Oath = {
      id: `oath-${now}`,
      habit,
      preface,
      startDate,
      endDate: length === 'forever' ? undefined : startDate + length * 24 * 60 * 60 * 1000,
      length,
      startTime,
      currencies: initialCurrencies,
      lastUpdated: now,
    };

    setOaths((prev) => [...prev, oath]);
    setNewOath(oath);
    setShowSealedModal(true);
  };

  const handleDeleteOath = (oathId: string) => {
    setOaths((prev) => prev.filter((o) => o.id !== oathId));
    setCurrentScreen('home');
  };

  const handleCompleteOath = (oath: Oath) => {
    const totalDays = Math.floor((Date.now() - oath.startDate) / (1000 * 60 * 60 * 24));
    const trophy: Trophy = {
      id: `trophy-${Date.now()}`,
      habit: oath.habit,
      preface: oath.preface,
      startDate: oath.startDate,
      completedDate: Date.now(),
      totalDays,
      finalCurrencies: { ...oath.currencies },
    };
    setTrophies((prev) => [...prev, trophy]);
    setCompletedOath(oath);
    setOaths((prev) => prev.filter((o) => o.id !== oath.id));
    setCurrentScreen('oath-success');
  };

  const handleCloseSealed = () => {
    setShowSealedModal(false);
    setNewOath(null);
    setCurrentScreen('home');
  };

  const handleBackFromSealed = () => {
    if (newOath) {
      setOaths((prev) => prev.filter((o) => o.id !== newOath.id)); // remove the oath
    }
    setShowSealedModal(false);
    setNewOath(null);
    setCurrentScreen('new-oath');
  };

  const handleDeleteTrophy = (trophyId: string) => {
    setTrophies((prev) => prev.filter((t) => t.id !== trophyId));
  };

  const selectedOath = oaths.find((o) => o.id === selectedOathId);

  return (
    <div className="min-h-screen bg-purple-800">
      {currentScreen === 'home' && (
        <HomeScreen
          oaths={oaths}
          trophyCount={trophies.length}
          onNewOath={() => setCurrentScreen('new-oath')}
          onSelectOath={(id) => {
            setSelectedOathId(id);
            setCurrentScreen('oath-detail');
          }}
          onOpenHalla={() => setCurrentScreen('oath-halla')}
        />
      )}

      {currentScreen === 'new-oath' && (
        <NewOathScreen
          onBack={() => setCurrentScreen('home')}
          onCreateOath={handleCreateOath}
        />
      )}

      {currentScreen === 'oath-detail' && selectedOath && (
        <OathDetailScreen
          oath={selectedOath}
          onBack={() => setCurrentScreen('home')}
          onDelete={handleDeleteOath}
          onComplete={handleCompleteOath}
        />
      )}

      {currentScreen === 'oath-success' && completedOath && (
        <OathSuccessScreen
          oath={completedOath}
          onContinue={() => setCurrentScreen('home')}
          onViewHalla={() => setCurrentScreen('oath-halla')}
        />
      )}

      {currentScreen === 'oath-halla' && (
        <OathHalla
          trophies={trophies}
          onBack={() => setCurrentScreen('home')}
          onDeleteTrophy={handleDeleteTrophy}
        />
      )}

      {showSealedModal && newOath && (
        <OathSealedModal oath={newOath} onClose={handleCloseSealed} onBack={handleBackFromSealed} />
      )}
    </div>
  );
}
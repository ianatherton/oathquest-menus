import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { NewOathScreen } from './components/NewOathScreen';
import { OathDetailScreen } from './components/OathDetailScreen';
import { OathSealedModal } from './components/OathSealedModal';

export interface Oath {
  id: string;
  habit: string;
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

type Screen = 'home' | 'new-oath' | 'oath-detail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedOathId, setSelectedOathId] = useState<string | null>(null);
  const [oaths, setOaths] = useState<Oath[]>(() => {
    const saved = localStorage.getItem('oathsData');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSealedModal, setShowSealedModal] = useState(false);
  const [newOath, setNewOath] = useState<Oath | null>(null);

  useEffect(() => {
    localStorage.setItem('oathsData', JSON.stringify(oaths));
  }, [oaths]);

  // Update currencies for all oaths based on time elapsed
  useEffect(() => {
    const interval = setInterval(() => {
      setOaths((prevOaths) =>
        prevOaths.map((oath) => {
          const now = Date.now();
          const timeSinceLastUpdate = (now - oath.lastUpdated) / 1000; // seconds

          // Calculate currency gains based on time
          // Tier 1: Willpower increases every second
          // Tier 2: Wellness increases every 30 seconds
          // Tier 3: Wisdom increases every minute (60 seconds)
          // Tier 4: Gold increases every 15 minutes (900 seconds)
          return {
            ...oath,
            currencies: {
              willpower: oath.currencies.willpower + timeSinceLastUpdate,
              wellness: oath.currencies.wellness + (timeSinceLastUpdate / 30),
              wisdom: oath.currencies.wisdom + (timeSinceLastUpdate / 60),
              gold: oath.currencies.gold + (timeSinceLastUpdate / 900),
            },
            lastUpdated: now,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateOath = (habit: string, length: 'forever' | number, startTime: string) => {
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
        wellness: elapsedSeconds / 30, // +1 per 30 seconds
        wisdom: elapsedSeconds / 60, // +1 per minute
        gold: elapsedSeconds / 900, // +1 per 15 minutes
      };
    }

    const oath: Oath = {
      id: `oath-${now}`,
      habit,
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

  const handleCloseSealed = () => {
    setShowSealedModal(false);
    setCurrentScreen('home');
  };

  const selectedOath = oaths.find((o) => o.id === selectedOathId);

  return (
    <div className="min-h-screen bg-purple-800">
      {currentScreen === 'home' && (
        <HomeScreen
          oaths={oaths}
          onNewOath={() => setCurrentScreen('new-oath')}
          onSelectOath={(id) => {
            setSelectedOathId(id);
            setCurrentScreen('oath-detail');
          }}
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
        />
      )}

      {showSealedModal && newOath && (
        <OathSealedModal oath={newOath} onClose={handleCloseSealed} />
      )}
    </div>
  );
}
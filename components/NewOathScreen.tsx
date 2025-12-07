import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface NewOathScreenProps {
  onBack: () => void;
  onCreateOath: (habit: string, preface: 'stop' | 'start', length: 'forever' | number, startTime: string) => void;
}

export function NewOathScreen({ onBack, onCreateOath }: NewOathScreenProps) {
  const [habit, setHabit] = useState('');
  const [preface, setPreface] = useState<'stop' | 'start'>('stop');
  const [lengthType, setLengthType] = useState<'forever' | 'for'>('forever');
  const [days, setDays] = useState('');
  const [startMode, setStartMode] = useState<'now' | 'past'>('now');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('PM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit.trim()) return;

    const length = lengthType === 'forever' ? 'forever' : parseInt(days) || 1;
    
    let time: string;
    if (startMode === 'now') {
      time = 'now';
    } else {
      time = `${startDate} ${hour}:${minute} ${ampm}`;
    }

    onCreateOath(habit, preface, length, time);
  };

  return (
    <div className="min-h-screen p-6" style={{ 
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0px, rgba(139, 92, 246, 0.3) 40px, rgba(126, 34, 206, 0.3) 40px, rgba(126, 34, 206, 0.3) 80px)',
      backgroundColor: '#7e22ce'
    }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="bg-purple-900 p-4 rounded-full border-4 border-purple-950 hover:bg-purple-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="bg-yellow-400 text-black px-8 py-4 rounded-xl border-4 border-black shadow-lg flex-1 text-center">
            <span>New Oath</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Empty icon box */}
          <div className="bg-purple-900/50 border-4 border-purple-950 rounded-xl p-8 flex items-center justify-center">
            <Plus className="w-24 h-24 text-purple-600" />
          </div>

          {/* Preface selection */}
          <div className="space-y-2">
            <label className="text-white block">
              <span className="bg-purple-900/70 px-4 py-2 rounded-lg border-2 border-purple-950 inline-block">
                I pledge to:
              </span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPreface('stop')}
                className={`flex-1 px-6 py-4 rounded-xl border-4 border-black transition-colors ${
                  preface === 'stop'
                    ? 'bg-red-400 text-black'
                    : 'bg-purple-900/70 text-white hover:bg-purple-800/70'
                }`}
              >
                🛑 Stop
              </button>
              <button
                type="button"
                onClick={() => setPreface('start')}
                className={`flex-1 px-6 py-4 rounded-xl border-4 border-black transition-colors ${
                  preface === 'start'
                    ? 'bg-green-400 text-black'
                    : 'bg-purple-900/70 text-white hover:bg-purple-800/70'
                }`}
              >
                🚀 Start
              </button>
            </div>
          </div>

          {/* Habit field */}
          <div className="space-y-2">
            <label className="text-white block">
              <span className="bg-purple-900/70 px-4 py-2 rounded-lg border-2 border-purple-950 inline-block">
                {preface === 'stop' ? 'What will you stop?' : 'What will you start?'}
              </span>
            </label>
            <input
              type="text"
              value={habit}
              onChange={(e) => setHabit(e.target.value)}
              placeholder={preface === 'stop' ? 'eating added sugar' : 'exercising daily'}
              className="w-full px-6 py-4 bg-white rounded-xl border-4 border-black text-black placeholder:text-gray-500"
              required
            />
          </div>

          {/* Length field */}
          <div className="space-y-2">
            <label className="text-white block">
              <span className="bg-purple-900/70 px-4 py-2 rounded-lg border-2 border-purple-950 inline-block">
                Length:
              </span>
            </label>
            <div className="flex gap-4 items-center flex-wrap">
              <button
                type="button"
                onClick={() => setLengthType('forever')}
                className={`px-6 py-4 rounded-xl border-4 border-black transition-colors ${
                  lengthType === 'forever'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-purple-900/70 text-white hover:bg-purple-800/70'
                }`}
              >
                Forever
              </button>
              <span className="text-white">/</span>
              <button
                type="button"
                onClick={() => setLengthType('for')}
                className={`px-6 py-4 rounded-xl border-4 border-black transition-colors ${
                  lengthType === 'for'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-purple-900/70 text-white hover:bg-purple-800/70'
                }`}
              >
                For
              </button>
              {lengthType === 'for' && (
                <>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="30"
                    min="1"
                    className="w-24 px-4 py-4 bg-white rounded-xl border-4 border-black text-black placeholder:text-gray-500"
                  />
                  <span className="text-white">Days</span>
                </>
              )}
            </div>
          </div>

          {/* Start time field */}
          <div className="space-y-2">
            <label className="text-white block">
              <span className="bg-purple-900/70 px-4 py-2 rounded-lg border-2 border-purple-950 inline-block">
                Start:
              </span>
            </label>
            <div className="space-y-4">
              {/* Starting Now Button */}
              <button
                type="button"
                onClick={() => setStartMode('now')}
                className={`w-full px-8 py-6 rounded-xl border-4 border-black transition-colors ${
                  startMode === 'now'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-purple-900/70 text-white hover:bg-purple-800/70'
                }`}
              >
                <span>Starting Now</span>
              </button>

              {/* Or Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-0.5 bg-white/30"></div>
                <span className="text-white/70">or</span>
                <div className="flex-1 h-0.5 bg-white/30"></div>
              </div>

              {/* Custom Date/Time */}
              <button
                type="button"
                onClick={() => setStartMode('past')}
                className={`w-full px-6 py-4 rounded-xl border-4 border-black transition-colors text-left ${
                  startMode === 'past'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-purple-900/70 text-white hover:bg-purple-800/70'
                }`}
              >
                <span>I {preface === 'stop' ? 'stopped' : 'started'} earlier</span>
              </button>

              {startMode === 'past' && (
                <div className="bg-purple-900/50 rounded-xl border-2 border-purple-950 p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-white text-sm">Date:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-white rounded-lg border-2 border-black text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white text-sm">Time:</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={hour}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 1 && val <= 12) setHour(e.target.value);
                          else if (e.target.value === '') setHour('');
                        }}
                        placeholder="12"
                        min="1"
                        max="12"
                        className="w-20 px-4 py-3 bg-white rounded-lg border-2 border-black text-black text-center"
                      />
                      <span className="text-white">:</span>
                      <input
                        type="number"
                        value={minute}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 0 && val <= 59) setMinute(e.target.value.padStart(2, '0'));
                          else if (e.target.value === '') setMinute('');
                        }}
                        placeholder="00"
                        min="0"
                        max="59"
                        className="w-20 px-4 py-3 bg-white rounded-lg border-2 border-black text-black text-center"
                      />
                      <select
                        value={ampm}
                        onChange={(e) => setAmpm(e.target.value as 'AM' | 'PM')}
                        className="px-4 py-3 bg-white rounded-lg border-2 border-black text-black"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!habit.trim()}
            className="w-full bg-yellow-400 text-black px-8 py-6 rounded-xl border-4 border-black shadow-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Create Oath</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
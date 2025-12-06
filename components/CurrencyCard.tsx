import { ReactNode } from 'react';

interface CurrencyCardProps {
  name: string;
  icon: ReactNode;
  value: number;
  color: 'red' | 'green' | 'blue' | 'yellow';
  description: string;
}

export function CurrencyCard({ name, icon, value, color, description }: CurrencyCardProps) {
  const formatDetailedNumber = (num: number) => {
    const rounded = Math.floor(num);
    
    // Show up to 12 digits (1 trillion) without abbreviations
    if (rounded < 1000000000000) {
      return rounded.toLocaleString();
    }
    
    // Beyond 12 digits, use letter notation
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let exponent = 12;
    let letterIndex = 0;

    while (letterIndex < letters.length) {
      const divisor = Math.pow(10, exponent);
      const nextDivisor = Math.pow(10, exponent + 3);
      
      if (num < nextDivisor) {
        return `${Math.floor(num / divisor).toLocaleString()}${letters[letterIndex]}`;
      }
      
      exponent += 3;
      letterIndex++;
    }

    return `${Math.floor(num / Math.pow(10, 12 + 25 * 3)).toLocaleString()}z`;
  };

  const colorClasses = {
    red: 'bg-red-400 border-red-900',
    green: 'bg-green-400 border-green-900',
    blue: 'bg-blue-400 border-blue-900',
    yellow: 'bg-yellow-400 border-yellow-900',
  };

  return (
    <div className={`${colorClasses[color]} border-4 rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white/30 p-3 rounded-full">{icon}</div>
        <div>
          <div className="text-black text-2xl">{name}</div>
          <div className="text-black/70 text-sm">{description}</div>
        </div>
      </div>
      <div className="text-black text-5xl text-center py-4 break-all">
        {formatDetailedNumber(value)}
      </div>
      <div className="bg-black/10 rounded-lg p-3 mt-4">
        <div className="text-black/70 text-sm text-center">
          Growing over time...
        </div>
      </div>
    </div>
  );
}
import { ReactNode, useState, useEffect, useRef } from 'react';

interface CurrencyCardProps {
  name: string;
  icon: ReactNode;
  value: number;
  color: 'red' | 'green' | 'blue' | 'yellow';
  description: string;
  particleSymbol: string;
  particleSpeed?: 'fast' | 'medium' | 'slow'; // fast=0.4s, medium=1.5s, slow=3s
}

interface Particle {
  id: number;
  x: number;
  rotateDir: number;
  rotateEnd: number;
}

export function CurrencyCard({ name, icon, value, color, description, particleSymbol, particleSpeed = 'medium' }: CurrencyCardProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevValueRef = useRef<number>(Math.floor(value));
  const particleIdRef = useRef(0);

  const durations = { fast: 700, medium: 1500, slow: 3000 };

  useEffect(() => {
    const currentFloor = Math.floor(value);
    const prevFloor = prevValueRef.current;
    
    if (currentFloor > prevFloor) { // currency ticked up
      const newParticle: Particle = {
        id: particleIdRef.current++,
        x: 15 + Math.random() * 70, // random horizontal position (15-85%)
        rotateDir: (Math.random() - 0.5) * 40, // -20 to +20 degrees
        rotateEnd: (Math.random() - 0.5) * 30, // -15 to +15 degrees
      };
      setParticles(prev => [...prev, newParticle]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, durations[particleSpeed]);
    }
    prevValueRef.current = currentFloor;
  }, [value, particleSpeed]);

  const formatDetailedNumber = (num: number) => {
    const rounded = Math.floor(num);
    if (rounded < 1000000000000) return rounded.toLocaleString();
    
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let exponent = 12;
    let letterIndex = 0;

    while (letterIndex < letters.length) {
      const divisor = Math.pow(10, exponent);
      const nextDivisor = Math.pow(10, exponent + 3);
      if (num < nextDivisor) return `${Math.floor(num / divisor).toLocaleString()}${letters[letterIndex]}`;
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
    <div className={`${colorClasses[color]} border-4 rounded-xl p-6 shadow-lg relative overflow-hidden`}>
      {/* Particles */}
      {particles.map(p => (
        <span
          key={p.id}
          className={`absolute text-2xl particle-${particleSpeed}`}
          style={{ 
            left: `${p.x}%`, 
            top: '40%',
            '--rotate-dir': `${p.rotateDir}deg`,
            '--rotate-end': `${p.rotateEnd}deg`,
          } as React.CSSProperties}
        >
          {particleSymbol}
        </span>
      ))}

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
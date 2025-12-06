import { useState } from 'react';

interface ClickButtonProps {
  onClick: () => void;
  clickValue: number;
}

export function ClickButton({ onClick, clickValue }: ClickButtonProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticle = { id: Date.now(), x, y };
    setParticles((prev) => [...prev, newParticle]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`w-full aspect-square max-w-sm mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 rounded-full shadow-2xl transition-all duration-100 flex items-center justify-center text-9xl border-8 border-yellow-300 relative overflow-hidden ${
          isPressed ? 'scale-95' : 'scale-100'
        }`}
      >
        💰
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute pointer-events-none animate-float-up"
            style={{
              left: particle.x,
              top: particle.y,
            }}
          >
            <span className="text-2xl">+{clickValue}</span>
          </div>
        ))}
      </button>
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px);
          }
        }
        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

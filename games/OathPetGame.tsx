import React from 'react';
import { Oath } from '../App';

interface OathPetGameProps {
  oath: Oath;
}

export default function OathPetGame({ oath }: OathPetGameProps) {
  const petLevel = Math.floor(oath.currencies.wellness / 60); // Wellness = pet XP, level up every 60 XP

  return (
    <div className="bg-purple-900/70 border-4 border-purple-950 rounded-xl p-8 text-white">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">🐾 Oath Pet</h2>
        <p className="text-purple-200">Raise and train companions to aid your oath!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-purple-800/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Pet Stats</h3>
          <div className="space-y-2">
            <div>Level: <span className="text-yellow-400 font-bold">{petLevel}</span></div>
            <div>Experience: <span className="text-blue-400">{Math.floor(oath.currencies.wellness)} XP</span></div>
            <div>Next Level: <span className="text-green-400">{(petLevel + 1) * 60} XP</span></div>
          </div>
        </div>

        <div className="bg-purple-800/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Companions</h3>
          <div className="space-y-2">
            <div>Active Pet: <span className="text-green-400">None</span></div>
            <div>Training Points: <span className="text-yellow-400">{petLevel}</span></div>
            <div>Available Buffs: <span className="text-purple-400">0</span></div>
          </div>
        </div>
      </div>

      <div className="bg-purple-800/50 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-4">Game Coming Soon!</h3>
        <p className="text-purple-200 mb-4">
          Raise magical companions that provide buffs and auto-attacks.
          Train different pet types with unique abilities and skill trees.
        </p>
        <div className="bg-green-600/20 border-2 border-green-400 rounded-lg p-4">
          <p className="text-green-200 font-semibold">Wellness grows your pet family!</p>
          <p className="text-sm text-green-300 mt-1">
            Level up through healthy habits, then spend training points on companion skills.
            Each pet provides different buffs - healing, damage, defense, and more.
          </p>
        </div>
      </div>
    </div>
  );
}

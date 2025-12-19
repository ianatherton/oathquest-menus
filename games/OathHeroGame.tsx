import React from 'react';
import { Oath } from '../App';

interface OathHeroGameProps {
  oath: Oath;
}

export default function OathHeroGame({ oath }: OathHeroGameProps) {
  const heroLevel = Math.floor(oath.currencies.willpower / 100); // Willpower = XP, level up every 100 XP

  return (
    <div className="bg-purple-900/70 border-4 border-purple-950 rounded-xl p-8 text-white">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">🛡️ Oath Hero</h2>
        <p className="text-purple-200">Defend your oath through battle!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-purple-800/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Hero Stats</h3>
          <div className="space-y-2">
            <div>Level: <span className="text-yellow-400 font-bold">{heroLevel}</span></div>
            <div>Experience: <span className="text-blue-400">{Math.floor(oath.currencies.willpower)} XP</span></div>
            <div>Next Level: <span className="text-green-400">{(heroLevel + 1) * 100} XP</span></div>
          </div>
        </div>

        <div className="bg-purple-800/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Equipment</h3>
          <div className="space-y-2">
            <div>Weapon: <span className="text-red-400">None equipped</span></div>
            <div>Armor: <span className="text-blue-400">Basic Clothes</span></div>
            <div>Skill Points: <span className="text-yellow-400">{heroLevel}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-purple-800/50 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-4">Game Coming Soon!</h3>
        <p className="text-purple-200 mb-4">
          Explore procedural areas, hunt enemies, collect weapons and armor, and level up your hero!
          Each kill grants experience and equipment drops that you can master through combat.
        </p>
        <div className="bg-yellow-600/20 border-2 border-yellow-400 rounded-lg p-4">
          <p className="text-yellow-200 font-semibold">Willpower fuels your hero's growth!</p>
          <p className="text-sm text-yellow-300 mt-1">
            Level up naturally through oath-keeping, then spend skill points on abilities.
            Find weapons and armor in battle, then master them through 100 kills each.
          </p>
        </div>
      </div>
    </div>
  );
}

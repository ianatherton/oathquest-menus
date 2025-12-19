import React from 'react';
import { Oath } from '../App';
import HeroGameRenderer from './hero/HeroGameRenderer';

interface OathHeroGameProps {
  oath: Oath;
}

export default function OathHeroGame({ oath }: OathHeroGameProps) {
  return (
    <div className="w-full h-full min-h-96">
      <HeroGameRenderer oath={oath} />
    </div>
  );
}

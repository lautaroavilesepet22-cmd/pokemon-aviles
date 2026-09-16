import React, { useState } from 'react';
import { GbaScreen } from './GbaScreen';
import { sounds } from '../audio/soundEffects';
import { Volume2, VolumeX, RotateCcw, Swords, Flame, Leaf, Droplets } from 'lucide-react';

interface GbaConsoleProps {
  onMessageLog?: (msg: string) => void;
}

export const GbaConsole: React.FC<GbaConsoleProps> = ({ onMessageLog }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [starter, setStarter] = useState<string>('CHARMANDER');
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playSelect();
  };

  const pressKey = (code: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code }));
    }, 100);
  };

  const handleReset = () => {
    sounds.playRun();
    setResetKey((k) => k + 1);
    onMessageLog?.('Juego reiniciado en Pueblo Paleta.');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Handheld Shell */}
      <div className="w-full bg-gradient-to-b from-indigo-900 via-indigo-950 to-neutral-950 p-4 sm:p-6 md:p-8 rounded-3xl border-4 border-indigo-700/60 shadow-[0_20px_50px_rgba(30,27,75,0.6)]">
        
        {/* Top Console Bar */}
        <div className="flex items-center justify-between mb-4 px-2 sm:px-4">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs sm:text-sm tracking-wider text-indigo-300 drop-shadow">
              GAME BOY <span className="text-red-500 font-bold">ADVANCE</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono bg-indigo-800/80 text-indigo-200 rounded border border-indigo-600/50">
              GBA SP
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Starter selector pills */}
            <div className="flex items-center bg-black/40 p-1 rounded-lg border border-indigo-800/50">
              <button
                id="btn-select-charmander"
                onClick={() => {
                  setStarter('CHARMANDER');
                  sounds.playSelect();
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  starter === 'CHARMANDER'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Charmander"
              >
                <Flame className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Charmander</span>
              </button>

              <button
                id="btn-select-bulbasaur"
                onClick={() => {
                  setStarter('BULBASAUR');
                  sounds.playSelect();
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  starter === 'BULBASAUR'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Bulbasaur"
              >
                <Leaf className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bulbasaur</span>
              </button>

              <button
                id="btn-select-squirtle"
                onClick={() => {
                  setStarter('SQUIRTLE');
                  sounds.playSelect();
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  starter === 'SQUIRTLE'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Squirtle"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Squirtle</span>
              </button>
            </div>

            {/* Sound Mute */}
            <button
              id="btn-toggle-sound"
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled
                  ? 'bg-indigo-700/60 border-indigo-500 text-indigo-200 hover:bg-indigo-600'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'
              }`}
              title={soundEnabled ? 'Silenciar audio' : 'Activar audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset */}
            <button
              id="btn-reset-game"
              onClick={handleReset}
              className="p-2 rounded-lg bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-all"
              title="Reiniciar partida"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Screen Area */}
        <div className="w-full flex justify-center">
          <GbaScreen
            key={resetKey}
            selectedStarter={starter}
            onBattleChange={setInBattle}
            onMessageLog={onMessageLog}
          />
        </div>

        {/* Controls Panel (Tactile D-Pad and Buttons for desktop & mobile) */}
        <div className="mt-6 pt-4 border-t border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-6 px-2 sm:px-6">
          
          {/* D-PAD Left */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 bg-neutral-900/90 rounded-full border-2 border-neutral-800 flex items-center justify-center shadow-inner">
              {/* Up */}
              <button
                id="btn-dpad-up"
                onMouseDown={() => pressKey('ArrowUp')}
                onTouchStart={(e) => {
                  e.preventDefault();
                  pressKey('ArrowUp');
                }}
                className="absolute top-2 w-10 h-10 bg-neutral-800 hover:bg-neutral-700 active:bg-indigo-600 rounded-t-lg border-t border-x border-neutral-700 text-neutral-300 font-bold flex items-center justify-center shadow"
              >
                ▲
              </button>

              {/* Down */}
              <button
                id="btn-dpad-down"
                onMouseDown={() => pressKey('ArrowDown')}
                onTouchStart={(e) => {
                  e.preventDefault();
                  pressKey('ArrowDown');
                }}
                className="absolute bottom-2 w-10 h-10 bg-neutral-800 hover:bg-neutral-700 active:bg-indigo-600 rounded-b-lg border-b border-x border-neutral-700 text-neutral-300 font-bold flex items-center justify-center shadow"
              >
                ▼
              </button>

              {/* Left */}
              <button
                id="btn-dpad-left"
                onMouseDown={() => pressKey('ArrowLeft')}
                onTouchStart={(e) => {
                  e.preventDefault();
                  pressKey('ArrowLeft');
                }}
                className="absolute left-2 w-10 h-10 bg-neutral-800 hover:bg-neutral-700 active:bg-indigo-600 rounded-l-lg border-l border-y border-neutral-700 text-neutral-300 font-bold flex items-center justify-center shadow"
              >
                ◄
              </button>

              {/* Right */}
              <button
                id="btn-dpad-right"
                onMouseDown={() => pressKey('ArrowRight')}
                onTouchStart={(e) => {
                  e.preventDefault();
                  pressKey('ArrowRight');
                }}
                className="absolute right-2 w-10 h-10 bg-neutral-800 hover:bg-neutral-700 active:bg-indigo-600 rounded-r-lg border-r border-y border-neutral-700 text-neutral-300 font-bold flex items-center justify-center shadow"
              >
                ►
              </button>

              {/* Center D-Pad hub */}
              <div className="w-8 h-8 bg-neutral-850 rounded-full border border-neutral-750" />
            </div>
            <span className="text-[10px] font-mono text-indigo-400 mt-1 uppercase">D-PAD</span>
          </div>

          {/* Center Start / Select */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <button
                  id="btn-select"
                  onClick={() => pressKey('KeyX')}
                  className="w-12 h-4 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-full border border-neutral-700 shadow transform -rotate-12"
                />
                <span className="text-[9px] font-mono text-neutral-400 mt-1 uppercase">SELECT</span>
              </div>
              <div className="flex flex-col items-center">
                <button
                  id="btn-start"
                  onClick={() => pressKey('Enter')}
                  className="w-12 h-4 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-full border border-neutral-700 shadow transform -rotate-12"
                />
                <span className="text-[9px] font-mono text-neutral-400 mt-1 uppercase">START</span>
              </div>
            </div>

            {/* Quick Trigger: Walk into tall grass shortcut for instant battle */}
            {!inBattle && (
              <button
                id="btn-wild-encounter"
                onClick={() => {
                  // Move up into tall grass
                  pressKey('ArrowUp');
                  setTimeout(() => pressKey('ArrowUp'), 250);
                  setTimeout(() => pressKey('ArrowUp'), 500);
                }}
                className="mt-2 flex items-center gap-1 px-2.5 py-1 text-[11px] font-pixel text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 rounded hover:bg-emerald-900 transition-all"
              >
                <Swords className="w-3 h-3 text-emerald-400" />
                <span>Explorar Hierba Alta</span>
              </button>
            )}
          </div>

          {/* Action Buttons Right (B and A) */}
          <div className="flex items-center gap-4">
            {/* Button B */}
            <div className="flex flex-col items-center">
              <button
                id="btn-action-b"
                onMouseDown={() => pressKey('KeyX')}
                onTouchStart={(e) => {
                  e.preventDefault();
                  pressKey('KeyX');
                }}
                className="w-14 h-14 bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 active:from-rose-700 active:to-rose-900 rounded-full border-2 border-rose-400/60 shadow-lg flex items-center justify-center text-white font-pixel text-sm"
              >
                B
              </button>
              <span className="text-[10px] font-mono text-neutral-400 mt-1">CANCEL [X]</span>
            </div>

            {/* Button A */}
            <div className="flex flex-col items-center -mt-6">
              <button
                id="btn-action-a"
                onMouseDown={() => pressKey('KeyZ')}
                onTouchStart={(e) => {
                  e.preventDefault();
                  pressKey('KeyZ');
                }}
                className="w-14 h-14 bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 active:from-rose-700 active:to-rose-900 rounded-full border-2 border-rose-400/60 shadow-lg flex items-center justify-center text-white font-pixel text-sm"
              >
                A
              </button>
              <span className="text-[10px] font-mono text-neutral-400 mt-1">ACCEPT [Z]</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GbaConsole } from './components/GbaConsole';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { Gamepad2, FileCode2, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'PLAY' | 'CODE'>('PLAY');
  const [logMessage, setLogMessage] = useState<string | null>(null);

  const handleMessageLog = (msg: string) => {
    setLogMessage(msg);
    setTimeout(() => {
      setLogMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-500/40">
              <span className="font-pixel text-xs text-white">PK</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <span>POKÉMON</span>
                  <span className="text-red-500 text-xs sm:text-sm font-pixel">ROJO FUEGO</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/50 font-mono">
                  GBA + Tkinter
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Prototipo con motor Canvas, Overworld, Batallas por turnos y script Python Tkinter
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              id="tab-play"
              onClick={() => setActiveTab('PLAY')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'PLAY'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Jugar Prototipo</span>
            </button>

            <button
              id="tab-code"
              onClick={() => setActiveTab('CODE')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'CODE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>Código Python (.py)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Floating Game Dialogue Notification Toast */}
      {logMessage && (
        <div className="fixed top-20 z-50 px-4 py-2 bg-indigo-900/95 border border-indigo-500 text-indigo-100 text-xs font-mono rounded-xl shadow-2xl animate-fade-in flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-300" />
          <span>{logMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col items-center">
        {activeTab === 'PLAY' ? (
          <div className="w-full flex flex-col items-center gap-8">
            {/* The Console */}
            <GbaConsole onMessageLog={handleMessageLog} />

            {/* Feature Checklist Breakdown */}
            <div className="w-full max-w-4xl p-5 sm:p-6 bg-neutral-900/80 border border-neutral-800 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider font-mono">
                  Mecánicas Implementadas (Estilo GBA Rojo Fuego)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-neutral-300">
                <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-100 block mb-0.5">Expansión: Ruta 1 & Pueblo Paleta</strong>
                    <span>Mapa ampliado 20x28 con la Ruta 1 al norte, vallas, flores, carteles leíbles y buzón de Red.</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-100 block mb-0.5">Sistema de EXP y Subida de Nivel</strong>
                    <span>Progreso real: barra de EXP cian, subida de nivel, fanfare y aumento de estadísticas (PS, Ataque, Defensa, Velocidad).</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-100 block mb-0.5">Mochila (15 Poké Balls & Pociones)</strong>
                    <span>Menú Mochila tanto en Overworld como en Combate. Lanza Poké Balls con trayectoria parabólica y mecánica de captura.</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-100 block mb-0.5">Hierba Alta y Casas Detalladas</strong>
                    <span>Hierba frondosa multicapa con briznas y brisa, casas con tejas 3D sombreadas, puertas de madera y ventanas con reflejos.</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-100 block mb-0.5">Pixel Art Detallado de Rattata GBA</strong>
                    <span>Silueta fiel de Rattata con cola rizada característica, bigotes, incisivos y orejas sombreadas.</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-100 block mb-0.5">Script Python Tkinter Sincronizado</strong>
                    <span>Código .py completo listo para copiar y ejecutar con el mapa ampliado, inventario y sistema de experiencia.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Python Code View */
          <PythonCodeViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 py-4 px-4 text-center text-xs text-neutral-500 font-mono">
        Pokémon Rojo Fuego / Verde Hoja Prototipo • Tkinter (Python 3) & Canvas Web Engine
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { PYTHON_TKINTER_CODE } from '../data/pythonScript';
import { Copy, Check, Download, FileCode2, Terminal, BookOpen, Sparkles } from 'lucide-react';

export const PythonCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_TKINTER_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = PYTHON_TKINTER_CODE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_TKINTER_CODE], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pokemon_rojo_fuego.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Banner with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/50 rounded-xl text-emerald-400">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-100 font-pixel text-xs tracking-wider">
              pokemon_rojo_fuego.py
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              100% Python estándar con Tkinter • Sin bibliotecas externas requeridas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Copy Button */}
          <button
            id="btn-copy-python"
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-all shadow"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-300" />
                <span>Copiar Código</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            id="btn-download-python"
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow"
          >
            <Download className="w-4 h-4" />
            <span>Descargar .py</span>
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Ejecución Local</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            No necesitas instalar Pygame ni paquetes pip. Abre una terminal y corre:
          </p>
          <code className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-emerald-400">
            python pokemon_rojo_fuego.py
          </code>
        </div>

        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Arquitectura POO</span>
          </div>
          <ul className="text-xs text-neutral-300 space-y-1">
            <li>• <strong className="text-neutral-100">class Pokemon:</strong> stats, ataques, HP.</li>
            <li>• <strong className="text-neutral-100">class TileMap:</strong> grid, colisiones y hierba.</li>
            <li>• <strong className="text-neutral-100">class Game:</strong> Tkinter, .after() loop.</li>
          </ul>
        </div>

        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Cómo Expandir</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Añade más tiles editando la matriz <code className="text-rose-300">DISENIO_MAPA</code> y más Pokémon modificando <code className="text-rose-300">generar_pokemon_salvaje()</code>.
          </p>
        </div>
      </div>

      {/* Code Box */}
      <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs font-mono text-neutral-400">pokemon_rojo_fuego.py (Python 3)</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">~600 líneas de código</span>
        </div>

        <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-neutral-300 overflow-x-auto max-h-[600px] leading-relaxed select-text">
          <code>{PYTHON_TKINTER_CODE}</code>
        </pre>
      </div>
    </div>
  );
};

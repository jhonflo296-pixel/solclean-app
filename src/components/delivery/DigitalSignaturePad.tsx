import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';

interface Props {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

export const DigitalSignaturePad: React.FC<Props> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ajustar resolución del canvas para pantallas retina/HiDPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      e.stopPropagation();
    }
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1 font-semibold text-slate-700">
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          <span>Firma de Conformidad del Cliente (Receptor)</span>
        </span>
        {hasDrawn && (
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Firma capturada
          </span>
        )}
      </div>

      <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden touch-none h-44 shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair block"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
            <PenTool className="w-6 h-6 mb-1 opacity-50" />
            <p className="text-xs font-medium">Dibuje su firma aquí con el dedo o lápiz táctil</p>
            <div className="w-48 h-0.5 border-b border-slate-300 mt-4 border-dashed" />
            <span className="text-[10px] text-slate-400 mt-1">Línea de firma</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={clearCanvas}
          disabled={!hasDrawn}
          className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 disabled:opacity-40 disabled:hover:text-slate-600 transition flex items-center gap-1 font-semibold"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Limpiar</span>
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasDrawn}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Firma</span>
          </button>
        </div>
      </div>
    </div>
  );
};

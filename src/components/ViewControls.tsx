import { RotateCw, Maximize } from 'lucide-preact';

interface Props {
  onRotate: () => void;
  onCenter: () => void;
}

export default function ViewControls({ onRotate, onCenter }: Props) {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#2b2b2b] p-[5px] rounded-lg flex gap-[5px] shadow-lg">
      <button onClick={onRotate} className="w-8 h-8 flex items-center justify-center text-zinc-200 hover:bg-zinc-700 rounded transition-colors" title="Rotar 90°">
        <RotateCw size={18} />
      </button>
      <button onClick={onCenter} className="w-8 h-8 flex items-center justify-center text-zinc-200 hover:bg-zinc-700 rounded transition-colors" title="Ajustar a la Pantalla">
        <Maximize size={18} />
      </button>
    </div>
  );
}
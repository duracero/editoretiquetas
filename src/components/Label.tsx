import { type LabelData, updateLabel, removeLabel, checkCollision, $branding } from '../store';
import { useStore } from '@nanostores/preact';
import { Trash2, RefreshCw } from 'lucide-preact';
import { useEffect, useState } from 'preact/hooks';
import clsx from 'clsx';

interface Props {
  data: LabelData;
  isAltPressed: boolean;
}

export default function Label({ data, isAltPressed }: Props) {
  const branding = useStore($branding);
  const [localTitle, setLocalTitle] = useState(data.title);
  const [localSubtitle, setLocalSubtitle] = useState(data.subtitle);
  const [localMeta, setLocalMeta] = useState(data.meta);

  // Sync collision or complex logic updates might be needed here, 
  // but mostly we update the store and let the parent re-render if position changes.
  
  const handleModifySpan = (dim: 'w' | 'h') => {
    let { x, y, w, h } = data;
    const delta = isAltPressed ? -1 : 1;
    
    if (dim === 'w') w += delta;
    if (dim === 'h') h += delta;

    // Constraints
    if (w < 1) w = 1;
    if (h < 1) h = 1;
    if (x + w - 1 > 3) w = 3 - x + 1;
    if (y + h - 1 > 3) h = 3 - y + 1;

    const newCfg = { x, y, w, h };

    if (!isAltPressed) {
       const collidedLabel = checkCollision(newCfg, data.id);
       if (collidedLabel) {
         removeLabel(collidedLabel.id);
       }
    }

    updateLabel(data.id, { w, h });
  };

  const toggleOrient = () => {
    updateLabel(data.id, { orientation: data.orientation === 'vertical' ? 'horizontal' : 'vertical' });
  };

  // Content Editable handlers
  const handleInput = (field: keyof LabelData, value: string) => {
    updateLabel(data.id, { [field]: value });
  };

  return (
    <div
      className="label border border-zinc-200 bg-white relative flex flex-col overflow-hidden transition-shadow group hover:z-20 hover:shadow-[inset_0_0_0_2px_#2563eb]"
      style={{
        gridColumn: `${data.x} / span ${data.w}`,
        gridRow: `${data.y} / span ${data.h}`,
      }}
    >
      {/* Tools Overlay */}
      <div className="label-tools absolute top-1 right-1 bg-zinc-900 rounded hidden flex-col gap-[1px] p-[2px] z-50 group-hover:flex">
        <button className="tool-btn w-6 h-6 flex items-center justify-center text-white hover:bg-zinc-700 rounded-sm" onClick={toggleOrient} title="Rotate Text">
          <RefreshCw size={12} />
        </button>
        <button className="tool-btn w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold hover:bg-zinc-700 rounded-sm" onClick={() => handleModifySpan('w')} title="Width">
          {isAltPressed ? 'W-' : 'W+'}
        </button>
        <button className="tool-btn w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold hover:bg-zinc-700 rounded-sm" onClick={() => handleModifySpan('h')} title="Height">
          {isAltPressed ? 'H-' : 'H+'}
        </button>
        <button className="tool-btn danger w-6 h-6 flex items-center justify-center text-white hover:bg-red-500 rounded-sm" onClick={() => removeLabel(data.id)} title="Delete">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Content */}
      <div className={clsx(
        "label-inner flex-1 p-[15mm] flex flex-col justify-start h-full",
        data.orientation === 'vertical' && "vertical-writing"
      )}>
        {/* CSS for vertical writing needs to be handled via style or class if not standard tailwind */}
        <style>{`
          .vertical-writing {
             writing-mode: vertical-rl;
             text-orientation: mixed;
             padding: 10mm;
             align-items: flex-start;
          }
          .vertical-writing .logo-area {
            writing-mode: horizontal-tb;
            margin-bottom: 1rem;
            align-self: center;
          }
          .vertical-writing .meta-data {
             border-left: none;
             border-top: 3px solid #000;
             padding-left: 0;
             padding-top: 10px;
             margin-top: auto;
          }
        `}</style>

        <div className="logo-area h-[40px] flex items-center mb-4 font-extrabold text-sm tracking-widest uppercase">
          {branding.type === 'custom' && branding.customImage ? (
             <img src={branding.customImage} className="max-h-full object-contain" alt="Logo" />
          ) : branding.type === 'novacero' ? (
             <span className="text-[#1976d2]">NOVACERO</span>
          ) : (
             <span className="text-black">DURACERO</span>
          )}
        </div>

        <div className="title-group flex-1 min-h-0">
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => handleInput('title', e.currentTarget.textContent || '')}
            className="main-title text-[2rem] font-extrabold uppercase leading-[1.1] mb-2 text-black outline-none focus:bg-blue-50 hover:bg-zinc-50 rounded"
          >
            {data.title}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => handleInput('subtitle', e.currentTarget.textContent || '')}
            className="sub-title text-[1.2rem] font-medium text-zinc-700 mb-4 outline-none focus:bg-blue-50 hover:bg-zinc-50 rounded"
          >
            {data.subtitle}
          </div>
        </div>

        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => handleInput('meta', e.currentTarget.textContent || '')}
          className="meta-data font-mono text-[0.85rem] text-zinc-500 border-l-3 border-black pl-2 outline-none focus:bg-blue-50 hover:bg-zinc-50 rounded whitespace-pre-wrap"
        >
            {data.meta}
        </div>
      </div>
    </div>
  );
}

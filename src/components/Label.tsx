import { type LabelData, updateLabel, removeLabel, checkCollision, $branding } from '../store';
import { useStore } from '@nanostores/preact';
import { Trash2, RefreshCw } from 'lucide-preact';
import clsx from 'clsx';
import EditableText from './EditableText';

interface Props {
  data: LabelData;
  isAltPressed: boolean;
}

export default function Label({ data, isAltPressed }: Props) {
  const branding = useStore($branding);
  
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

  const handleInput = (field: keyof LabelData, value: string) => {
    updateLabel(data.id, { [field]: value });
  };

  const resolveLogo = () => {
    if (data.logoType) return data.logoType;
    return branding.type;
  };

  const cycleLogo = () => {
    const current = data.logoType;
    let next: 'duracero' | 'novacero' | undefined;
    
    if (current === undefined) next = 'duracero';
    else if (current === 'duracero') next = 'novacero';
    else next = undefined;
    
    updateLabel(data.id, { logoType: next });
  };

  return (
    <div
      className="label pointer-events-auto border border-zinc-200 bg-white relative flex flex-col overflow-hidden transition-shadow group hover:z-20 hover:shadow-[inset_0_0_0_2px_#2563eb]"
      style={{
        gridColumn: `${data.x} / span ${data.w}`,
        gridRow: `${data.y} / span ${data.h}`,
      }}
    >
      {/* Tools Overlay */}
      <div className="label-tools absolute top-1 right-1 bg-zinc-900 rounded hidden flex-col gap-[1px] p-[2px] z-50 group-hover:flex">
        <button className="tool-btn w-6 h-6 flex items-center justify-center text-white hover:bg-zinc-700 rounded-sm" onClick={toggleOrient} title="Rotar Texto">
          <RefreshCw size={12} />
        </button>
        <button className="tool-btn w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold hover:bg-zinc-700 rounded-sm" onClick={() => handleModifySpan('w')} title="Ancho">
          {isAltPressed ? 'W-' : 'W+'}
        </button>
        <button className="tool-btn w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold hover:bg-zinc-700 rounded-sm" onClick={() => handleModifySpan('h')} title="Alto">
          {isAltPressed ? 'H-' : 'H+'}
        </button>
        <button className="tool-btn danger w-6 h-6 flex items-center justify-center text-white hover:bg-red-500 rounded-sm" onClick={() => removeLabel(data.id)} title="Eliminar">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Content */}
      <div className={clsx(
        "label-inner flex-1 flex flex-col justify-start h-full",
        "p-2", // Reduced padding
        data.orientation === 'vertical' && "vertical-writing"
      )}>
        <style>{`
          .vertical-writing {
             writing-mode: vertical-rl;
             text-orientation: mixed;
             padding: 0.5rem;
             align-items: flex-start;
          }
          .vertical-writing .logo-area {
            writing-mode: horizontal-tb;
            margin-bottom: 0.25rem;
            align-self: center;
            
            /* Sizing for vertical layout compatibility */
            width: 24px; /* Matches h-6 (1.5rem = 24px) */
            height: 100px; /* Space for the rotated logo width */
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .vertical-writing .logo-area img {
             transform: rotate(90deg); /* Clockwise rotation */
             width: 100px;
             height: 24px;
             object-fit: contain;
          }
          .vertical-writing .meta-data {
             border-left: none;
             border-top: 2px solid #000;
             padding-left: 0;
             padding-top: 6px;
             margin-top: auto;
          }
        `}</style>

        <div 
          className="logo-area h-6 flex items-center mb-1 font-extrabold text-sm tracking-widest uppercase cursor-pointer hover:opacity-80 transition-opacity shrink-0"
          onClick={cycleLogo}
          title="Clic para cambiar logo"
        >
          {resolveLogo() === 'custom' && branding.customImage ? (
             <img src={branding.customImage} className="max-h-full object-contain" alt="Logo" />
          ) : resolveLogo() === 'novacero' ? (
             <img src="/brand_logos/novacero_brand.png" className="max-h-full object-contain" alt="Novacero" />
          ) : (
             <img src="/brand_logos/duracero_brand.png" className="max-h-full object-contain" alt="Duracero" />
          )}
        </div>

        <div className="title-group flex-1 min-h-0 flex flex-col">
          <EditableText
            initialValue={data.title}
            defaultText="ETIQUETA"
            onUpdate={(val) => handleInput('title', val)}
            className="main-title text-xl font-extrabold uppercase leading-[1.1] mb-1 text-black hover:bg-zinc-50 rounded min-w-[50px]"
          />
          <EditableText
            initialValue={data.subtitle}
            defaultText="Descripción"
            onUpdate={(val) => handleInput('subtitle', val)}
            className="sub-title text-xs font-medium text-zinc-700 mb-2 hover:bg-zinc-50 rounded min-w-[50px]"
          />
        </div>

        <EditableText
          initialValue={data.meta}
          onUpdate={(val) => handleInput('meta', val)}
          className="meta-data font-mono text-[0.65rem] text-zinc-500 border-l-2 border-black pl-2 hover:bg-zinc-50 rounded whitespace-pre-wrap"
        />
      </div>
    </div>
  );
}

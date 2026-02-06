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
    if (x + w - 1 > 6) w = 6 - x + 1;
    if (y + h - 1 > 6) h = 6 - y + 1;

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

  const handleRemoveField = (field: keyof LabelData | 'logo') => {
    if (field === 'logo') {
       updateLabel(data.id, { logoType: 'none' });
    } else {
       updateLabel(data.id, { [field]: null });
    }
  };

  // Helper for delete button
  const FieldRemover = ({ onClick }: { onClick: () => void }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="absolute -right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white p-1 rounded-full shadow opacity-0 group-hover/field:opacity-100 transition-opacity z-10"
      title="Eliminar campo"
    >
      <Trash2 size={10} />
    </button>
  );

  // Dimensions based on A4 sheet (210mm x 297mm) and 6x6 grid
  const CELL_W = 35;
  const CELL_H = 49.5;
  
  const isVertical = data.orientation === 'vertical';
  
  // Smart Print Padding Logic
  const isTopEdge = data.y === 1;
  const isBottomEdge = data.y + data.h - 1 === 6;
  const isLeftEdge = data.x === 1;
  const isRightEdge = data.x + data.w - 1 === 6;

  const printClasses = isVertical 
    ? clsx(
        isTopEdge ? 'print:pl-0' : 'print:pl-6',      // Physical Top -> Visual Left
        isRightEdge ? 'print:pt-0' : 'print:pt-6',    // Physical Right -> Visual Top
        isBottomEdge ? 'print:pr-0' : 'print:pr-6',   // Physical Bottom -> Visual Right
        isLeftEdge ? 'print:pb-0' : 'print:pb-6'      // Physical Left -> Visual Bottom
      )
    : clsx(
        isTopEdge ? 'print:pt-0' : 'print:pt-6',
        isRightEdge ? 'print:pr-0' : 'print:pr-6',
        isBottomEdge ? 'print:pb-0' : 'print:pb-6',
        isLeftEdge ? 'print:pl-0' : 'print:pl-6'
      );

  const innerStyle = isVertical ? {
    width: `${data.h * CELL_H}mm`,
    height: `${data.w * CELL_W}mm`,
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(90deg)',
  } : {
    width: '100%',
    height: '100%'
  };

  return (
    <div
      className="label pointer-events-auto border border-zinc-200 bg-white relative transition-shadow group hover:z-20 hover:shadow-[inset_0_0_0_2px_#2563eb]"
      style={{
        gridColumn: `${data.x} / span ${data.w}`,
        gridRow: `${data.y} / span ${data.h}`,
      }}
    >
      {/* Tools Overlay */}
      <div className="label-tools absolute -right-8 top-0 bg-zinc-900 rounded flex flex-col gap-[1px] p-[2px] z-50 opacity-0 invisible transition-all duration-300 delay-300 group-hover:opacity-100 group-hover:visible group-hover:delay-0">
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
      <div 
        className={clsx(
          "label-inner flex flex-col justify-start overflow-hidden",
          "p-6" // Increased padding
        )}
        style={innerStyle}
      >
        {resolveLogo() !== 'none' && (
          <div 
            className="logo-area group/field relative flex items-center mb-6 shrink-0 max-h-[7%] min-h-[24px]"
          >
            <div 
              className="flex items-center font-extrabold text-sm tracking-widest uppercase cursor-pointer hover:opacity-80 transition-opacity h-full w-full"
              onClick={cycleLogo}
              title="Clic para cambiar logo"
            >
              {resolveLogo() === 'custom' && branding.customImage ? (
                 <img src={branding.customImage} className="max-h-full object-contain" alt="Logo" />
              ) : resolveLogo() === 'novacero' ? (
                 <img src={`${import.meta.env.BASE_URL}/brand_logos/novacero_brand.png`} className="max-h-full object-contain" alt="Novacero" />
              ) : (
                 <img src={`${import.meta.env.BASE_URL}/brand_logos/duracero_brand.png`} className="max-h-full object-contain" alt="Duracero" />
              )}
            </div>
            <FieldRemover onClick={() => handleRemoveField('logo')} />
          </div>
        )}

        <div className="title-group flex-1 min-h-0 flex flex-col">
          {data.title !== null && (
            <div className="group/field relative mb-0">
               <EditableText
                initialValue={data.title}
                defaultText="ETIQUETA"
                onUpdate={(val) => handleInput('title', val)}
                className="main-title text-3xl font-extrabold uppercase leading-[0.95] text-black hover:bg-zinc-50 rounded min-w-[50px]"
              />
              <FieldRemover onClick={() => handleRemoveField('title')} />
            </div>
          )}
          
          {data.subtitle !== null && (
            <div className="group/field relative mb-2">
              <EditableText
                initialValue={data.subtitle}
                defaultText="Descripción"
                onUpdate={(val) => handleInput('subtitle', val)}
                className="sub-title text-2xl font-medium text-zinc-700 hover:bg-zinc-50 rounded min-w-[50px]"
              />
              <FieldRemover onClick={() => handleRemoveField('subtitle')} />
            </div>
          )}
        </div>

        {data.meta !== null && (
          <div className="group/field relative mt-auto">
            <EditableText
              initialValue={data.meta}
              onUpdate={(val) => handleInput('meta', val)}
              className="meta-data font-mono text-sm text-zinc-500 border-l-2 border-black pl-2 hover:bg-zinc-50 rounded whitespace-pre-wrap"
            />
            <FieldRemover onClick={() => handleRemoveField('meta')} />
          </div>
        )}
      </div>
    </div>
  );
}
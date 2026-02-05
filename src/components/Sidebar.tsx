import { applyPreset, $branding, type BrandingState } from '../store';
import { useStore } from '@nanostores/preact';

export default function Sidebar() {
  const branding = useStore($branding);

  const handleLogoUpload = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        $branding.set({ type: 'custom', customImage: evt.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const setBrand = (type: BrandingState['type']) => {
    $branding.setKey('type', type);
  };

  return (
    <aside className="w-[280px] bg-[#2b2b2b] border-r border-zinc-700 p-6 flex flex-col gap-8 z-50 shadow-2xl shrink-0 h-full">
      {/* Brand Header */}
      <div className="flex items-center gap-3 text-white mb-2">
        <svg viewBox="0 0 100 100" className="w-8 h-8 fill-white">
          <rect x="10" y="10" width="35" height="80" fill="#fff"/>
          <rect x="55" y="10" width="35" height="35" fill="#2563eb"/>
          <rect x="55" y="55" width="35" height="35" fill="#fff"/>
        </svg>
        <span className="font-bold text-lg tracking-wider">DURACERO</span>
      </div>

      {/* Presets */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-3 pb-1 border-b border-zinc-700">Grid Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {['compact', 'rows', 'cols', 'full'].map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset as any)}
              className="p-2 border border-zinc-700 bg-zinc-700 text-zinc-200 rounded text-sm hover:bg-zinc-600 hover:border-zinc-500 transition-colors capitalize"
            >
              {preset === 'compact' ? '9 Compact' : preset === 'rows' ? '3 Rows' : preset === 'cols' ? '3 Cols' : 'Full Page'}
            </button>
          ))}
        </div>
      </div>

      {/* Branding */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-3 pb-1 border-b border-zinc-700">Branding</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setBrand('duracero')}
            className={`p-2 border rounded text-sm transition-colors ${branding.type === 'duracero' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-700 border-zinc-700 text-zinc-200 hover:bg-zinc-600'}`}
          >
            Duracero
          </button>
          <button
            onClick={() => setBrand('novacero')}
            className={`p-2 border rounded text-sm transition-colors ${branding.type === 'novacero' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-700 border-zinc-700 text-zinc-200 hover:bg-zinc-600'}`}
          >
            Novacero
          </button>
          <label className="p-2 border border-zinc-700 bg-zinc-700 text-zinc-200 rounded text-sm hover:bg-zinc-600 hover:border-zinc-500 transition-colors cursor-pointer text-center">
            Upload
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Controls Helper */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-3 pb-1 border-b border-zinc-700">Controls</h3>
        <div className="text-xs text-zinc-400 leading-relaxed">
          <p><strong>Zoom:</strong> Cmd/Alt + Scroll</p>
          <p><strong>Scroll:</strong> Mouse Wheel</p>
          <p><strong>Pan:</strong> Space + Drag</p>
          <p><strong>Resize:</strong> W/H Buttons (Alt to shrink)</p>
        </div>
      </div>

      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="mt-auto w-full p-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors"
      >
        PRINT TO PDF
      </button>
    </aside>
  );
}

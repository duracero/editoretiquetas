import { map, atom } from 'nanostores';

export type LabelData = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: 'horizontal' | 'vertical';
  title: string | null;
  subtitle: string | null;
  meta: string | null;
  logoType?: 'duracero' | 'novacero' | 'custom' | 'none';
};

export type BrandingState = {
  type: 'duracero' | 'novacero' | 'custom';
  customImage: string | null;
};

export const $labels = atom<LabelData[]>([]);
export const $branding = map<BrandingState>({ type: 'duracero', customImage: null });

export const PRESETS = {
  'compact': (() => {
    const labels = [];
    for (let i = 0; i < 9; i++) {
       const col = i % 3;
       const row = Math.floor(i / 3);
       // x: 1, 3, 5... y: 1, 3, 5...
       labels.push({ x: (col * 2) + 1, y: (row * 2) + 1, w: 2, h: 2 });
    }
    return labels;
  })(),
  'rows': [{ x: 1, y: 1, w: 6, h: 2 }, { x: 1, y: 3, w: 6, h: 2 }, { x: 1, y: 5, w: 6, h: 2 }],
  'cols': [{ x: 1, y: 1, w: 2, h: 6, orientation: 'vertical' }, { x: 3, y: 1, w: 2, h: 6, orientation: 'vertical' }, { x: 5, y: 1, w: 2, h: 6, orientation: 'vertical' }],
  'full': [{ x: 1, y: 1, w: 6, h: 6 }]
};

export const addLabel = (label: LabelData) => {
  $labels.set([...$labels.get(), label]);
};

export const updateLabel = (id: string, updates: Partial<LabelData>) => {
  const current = $labels.get();
  $labels.set(current.map(l => l.id === id ? { ...l, ...updates } : l));
};

export const removeLabel = (id: string) => {
  $labels.set($labels.get().filter(l => l.id !== id));
};

export const clearLabels = () => {
  $labels.set([]);
};

export const applyPreset = (presetName: keyof typeof PRESETS) => {
  clearLabels();
  const preset = PRESETS[presetName];
  if (!preset) return;

  const newLabels = preset.map((cfg, idx) => ({
    id: crypto.randomUUID(),
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.h,
    orientation: cfg.orientation || 'horizontal',
    title: 'ETIQUETA',
    subtitle: 'Descripción',
    meta: 'REF: #001\nLOC: A-1',
    logoType: $branding.get().type === 'custom' ? undefined : $branding.get().type
  } as LabelData));

  $labels.set(newLabels);
};

export const checkCollision = (target: { x: number, y: number, w: number, h: number }, excludeId?: string) => {
  const targetCells = new Set();
  for (let i = 0; i < target.w; i++) {
    for (let j = 0; j < target.h; j++) {
      targetCells.add(`${target.x + i}-${target.y + j}`);
    }
  }

  const labels = $labels.get();
  for (const label of labels) {
    if (label.id === excludeId) continue;
    
    for (let i = 0; i < label.w; i++) {
      for (let j = 0; j < label.h; j++) {
        const cell = `${label.x + i}-${label.y + j}`;
        if (targetCells.has(cell)) return label;
      }
    }
  }
  return null;
};

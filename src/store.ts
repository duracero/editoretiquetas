import { map, atom } from 'nanostores';

export type LabelData = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: 'horizontal' | 'vertical';
  title: string;
  subtitle: string;
  meta: string;
  logoType?: 'duracero' | 'novacero' | 'custom';
};

export type BrandingState = {
  type: 'duracero' | 'novacero' | 'custom';
  customImage: string | null;
};

export const $labels = atom<LabelData[]>([]);
export const $branding = map<BrandingState>({ type: 'duracero', customImage: null });

export const PRESETS = {
  'compact': Array(9).fill(null).map((_, i) => ({ x: (i % 3) + 1, y: Math.floor(i / 3) + 1, w: 1, h: 1 })),
  'rows': [{ x: 1, y: 1, w: 3, h: 1 }, { x: 1, y: 2, w: 3, h: 1 }, { x: 1, y: 3, w: 3, h: 1 }],
  'cols': [{ x: 1, y: 1, w: 1, h: 3, orientation: 'vertical' }, { x: 2, y: 1, w: 1, h: 3, orientation: 'vertical' }, { x: 3, y: 1, w: 1, h: 3, orientation: 'vertical' }],
  'full': [{ x: 1, y: 1, w: 3, h: 3 }]
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
    title: 'LABEL',
    subtitle: 'Description',
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

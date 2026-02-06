import { useState } from 'preact/hooks';
import { addLabel, checkCollision } from '../store';
import clsx from 'clsx';

export default function GridLayer() {
  const [hovered, setHovered] = useState<{x: number, y: number} | null>(null);

  const ghosts = Array(36).fill(null).map((_, i) => {
    const x = (i % 6) + 1;
    const y = Math.floor(i / 6) + 1;
    return { x, y };
  });

  const handleCreate = (x: number, y: number) => {
    if (checkCollision({ x, y, w: 2, h: 2 })) return;

    addLabel({
      id: crypto.randomUUID(),
      x, y, w: 2, h: 2,
      orientation: 'horizontal',
      title: 'ETIQUETA',
      subtitle: 'Descripción',
      meta: 'REF: #001\nLOC: A-1',
    });
  };

  const isHighlighted = (x: number, y: number) => {
    if (!hovered) return false;
    // Check if current cell (x,y) is within the 2x2 box starting at hovered cell
    return x >= hovered.x && x < hovered.x + 2 && y >= hovered.y && y < hovered.y + 2;
  };

  return (
    <div id="ghost-layer" className="absolute top-0 left-0 w-full h-full grid grid-cols-6 grid-rows-6 z-0 pointer-events-none print:hidden">
       {/* pointer-events-none on container so clicks pass through to actual ghosts, 
           but ghosts need pointer-events-auto */}
      {ghosts.map((g, i) => {
        const active = isHighlighted(g.x, g.y);
        const isTrigger = hovered?.x === g.x && hovered?.y === g.y;
        
        return (
          <div
            key={i}
            onClick={() => handleCreate(g.x, g.y)}
            onMouseEnter={() => setHovered({ x: g.x, y: g.y })}
            onMouseLeave={() => setHovered(null)}
            className={clsx(
              "ghost-cell border border-dashed border-zinc-300 flex items-center justify-center cursor-pointer transition-colors pointer-events-auto",
              active && "bg-zinc-100"
            )}
            style={{ gridColumnStart: g.x, gridRowStart: g.y }}
          >
            <span 
              className={clsx(
                "text-4xl text-zinc-300 transform scale-50 transition-all",
                isTrigger ? "opacity-100 scale-100" : "opacity-0"
              )}
            >
              +
            </span>
          </div>
        );
      })}
    </div>
  );
}
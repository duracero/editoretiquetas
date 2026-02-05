import { addLabel, checkCollision } from '../store';

export default function GridLayer() {
  const ghosts = Array(9).fill(null).map((_, i) => {
    const x = (i % 3) + 1;
    const y = Math.floor(i / 3) + 1;
    return { x, y };
  });

  const handleCreate = (x: number, y: number) => {
    // Basic check if space is free (though original code allows creating over if not colliding immediately with complex logic, 
    // but here we just create a 1x1. Store logic handles collision on resize usually, but creation should be safe?
    // The original code: ghost.onclick => createLabel({x,y,w:1,h:1}) which checks collision immediately.
    
    if (checkCollision({ x, y, w: 1, h: 1 })) return;

    addLabel({
      id: crypto.randomUUID(),
      x, y, w: 1, h: 1,
      orientation: 'horizontal',
      title: 'LABEL',
      subtitle: 'Description',
      meta: 'REF: #001, LOC: A-1',
    });
  };

  return (
    <div id="ghost-layer" className="absolute top-0 left-0 w-full h-full grid grid-cols-3 grid-rows-3 z-0 pointer-events-none">
       {/* pointer-events-none on container so clicks pass through to actual ghosts, 
           but ghosts need pointer-events-auto */}
      {ghosts.map((g, i) => (
        <div
          key={i}
          onClick={() => handleCreate(g.x, g.y)}
          className="ghost-cell border border-dashed border-zinc-300 flex items-center justify-center cursor-pointer transition-colors hover:bg-zinc-100 group pointer-events-auto"
          style={{ gridColumnStart: g.x, gridRowStart: g.y }}
        >
          <span className="text-4xl text-zinc-300 opacity-0 transform scale-50 transition-all group-hover:opacity-100 group-hover:scale-100">+</span>
        </div>
      ))}
    </div>
  );
}

import { useStore } from '@nanostores/preact';
import { $labels } from '../store';
import GridLayer from './GridLayer';
import Label from './Label';
import { useEffect, useState } from 'preact/hooks';

export default function Sheet() {
  const labels = useStore($labels);
  const [isAltPressed, setIsAltPressed] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => e.key === 'Alt' && setIsAltPressed(true);
    const up = (e: KeyboardEvent) => e.key === 'Alt' && setIsAltPressed(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return (
    <div id="sheet" className="bg-white relative shadow-2xl origin-center w-[210mm] h-[297mm]">
       <GridLayer />
       <div id="labels-container" className="absolute top-0 left-0 w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none z-10">
         {labels.map(label => (
           <Label key={label.id} data={label} isAltPressed={isAltPressed} />
         ))}
       </div>
    </div>
  );
}
import { useRef, useEffect, useState } from 'preact/hooks';
import Sheet from './Sheet';
import ViewControls from './ViewControls';
import clsx from 'clsx';

export default function Workspace() {
  const containerRef = useRef<HTMLElement>(null);
  const panLayerRef = useRef<HTMLDivElement>(null);
  const sheetRotatorRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for values to avoid stale closures in event listeners if we used only state
  const stateRef = useRef({ scale: 1, panX: 0, panY: 0, isSpacePressed: false, isDragging: false });
  
  // Sync refs
  useEffect(() => {
    stateRef.current = { scale, panX: pan.x, panY: pan.y, isSpacePressed, isDragging };
  }, [scale, pan, isSpacePressed, isDragging]);

  const updateTransform = () => {
    if (panLayerRef.current) {
      panLayerRef.current.style.transform = `translate(${stateRef.current.panX}px, ${stateRef.current.panY}px) scale(${stateRef.current.scale})`;
    }
  };
  
  // Effect for updating transform when state changes (initial load or button clicks)
  useEffect(() => {
    updateTransform();
  }, [scale, pan]);

  const centerContent = () => {
    if (!containerRef.current || !sheetRotatorRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    // Default sheet size is fixed, but we need to know its rendered size.
    // However, sheetRotator has explicit size in CSS usually or implied by content.
    // In our CSS, #sheet is 210mm x 297mm.
    const sheetW = sheetRotatorRef.current.offsetWidth;
    const sheetH = sheetRotatorRef.current.offsetHeight;
    
    const newScale = (r.height * 0.8) / sheetH;
    const newPanX = (r.width - (sheetW * newScale)) / 2;
    const newPanY = (r.height - (sheetH * newScale)) / 2;
    
    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  useEffect(() => {
    centerContent();
    window.addEventListener('resize', centerContent);
    return () => window.removeEventListener('resize', centerContent);
  }, []);

  // Event Listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || e.altKey) {
        // Zoom
        const zoomIntensity = 0.1;
        const delta = -Math.sign(e.deltaY);
        const { scale: oldScale, panX, panY } = stateRef.current;
        
        const newScale = Math.min(Math.max(0.1, oldScale + (delta * zoomIntensity * oldScale)), 5);
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleRatio = newScale / oldScale;
        const newPanX = mouseX - (mouseX - panX) * scaleRatio;
        const newPanY = mouseY - (mouseY - panY) * scaleRatio;

        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
      } else {
        // Pan
        setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
       if (e.code === 'Space' && !e.repeat && !(e.target as HTMLElement).isContentEditable) {
         e.preventDefault();
         setIsSpacePressed(true);
       }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
       if (e.code === 'Space') {
         setIsSpacePressed(false);
         setIsDragging(false);
       }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (stateRef.current.isSpacePressed) {
        setIsDragging(true);
      }
    };

    // We attach mousemove/up to window to catch drags outside container
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Wrapper to capture initial position
    const onMouseDownWrapper = (e: MouseEvent) => {
        if(stateRef.current.isSpacePressed) {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            handleMouseDown(e);
        }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (stateRef.current.isDragging && stateRef.current.isSpacePressed) {
        e.preventDefault();
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', onMouseDownWrapper);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', onMouseDownWrapper);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <main
      id="workspace"
      ref={containerRef}
      className={clsx(
        "flex-1 relative overflow-hidden bg-[#1e1e20] cursor-default",
        "bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]",
        isSpacePressed && "pan-mode"
      )}
    >
      <div id="pan-layer" ref={panLayerRef} className="w-full h-full origin-top-left will-change-transform">
        <div
          id="sheet-rotator"
          ref={sheetRotatorRef}
          className="w-[210mm] h-[297mm] transition-transform duration-300 ease-out shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className={clsx(isSpacePressed && "pointer-events-none")}>
             <Sheet />
          </div>
        </div>
      </div>

      <ViewControls onRotate={handleRotate} onCenter={centerContent} />
    </main>
  );
}

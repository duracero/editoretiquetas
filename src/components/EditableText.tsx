import { useRef, useEffect, useState } from 'preact/hooks';
import clsx from 'clsx';

interface EditableTextProps {
  initialValue: string;
  className?: string;
  onUpdate: (val: string) => void;
  defaultText?: string;
}

export default function EditableText({ initialValue, className, onUpdate, defaultText }: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Only update content if we are NOT focused, to allow external updates but prevent cursor jumps while typing
    if (!isFocused && ref.current && ref.current.textContent !== initialValue) {
      ref.current.textContent = initialValue;
    }
  }, [initialValue, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    if (defaultText && ref.current?.textContent === defaultText) {
       // Clear text if it matches default, or select all?
       // User asked: "when i click on a default text it deletes the entire text?"
       // We can clear it.
       if(ref.current) ref.current.textContent = '';
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (ref.current) {
      let val = ref.current.textContent || '';
      // If empty on blur, maybe revert to default or keep empty? User just said delete on click. 
      // Often better to keep empty or let parent decide.
      onUpdate(val);
    }
  };

  const handleInput = () => {
      // We don't update parent immediately to avoid re-render loop if parent passes back value
      // But we can debounce if needed. For now, we update on blur to be safe, 
      // OR we update parent but ensure parent's new prop doesn't override us while focused (handled by useEffect guard).
      if(ref.current) {
          onUpdate(ref.current.textContent || '');
      }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={clsx(className, "outline-none")}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleInput}
    />
  );
}

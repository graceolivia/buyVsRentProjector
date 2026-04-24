import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  formula: string;
  result: string;
  explanation?: string;
}

export function NumberWithFormula({ value, formula, result, explanation }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-mono underline decoration-dotted underline-offset-2 cursor-pointer text-blue-700 hover:text-blue-900"
        title="Click to see formula"
      >
        {value}
      </button>
      {open && (
        <span className="absolute z-10 bottom-full mb-1 left-0 bg-white border border-gray-300 rounded shadow-lg p-3 text-sm w-72 text-left">
          <div className="font-mono text-gray-800 mb-1">{formula}</div>
          <div className="font-mono text-gray-600 mb-1">{result}</div>
          {explanation && <div className="text-gray-500 text-xs">{explanation}</div>}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-1 right-2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        </span>
      )}
    </span>
  );
}

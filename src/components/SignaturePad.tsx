import { useRef, useState, useImperativeHandle, forwardRef, PointerEvent } from 'react';

export interface SignaturePadHandle {
  clear: () => void;
  toSVG: () => string | null;
  isEmpty: () => boolean;
}

interface Props {
  width?: number;
  height?: number;
  strokeColor?: string;
}

const SignaturePad = forwardRef<SignaturePadHandle, Props>(
  ({ width = 480, height = 160, strokeColor = 'currentColor' }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [strokes, setStrokes] = useState<string[]>([]);
    const [current, setCurrent] = useState<string>('');
    const drawing = useRef(false);

    const getPoint = (e: PointerEvent<SVGSVGElement>) => {
      const rect = svgRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width;
      const y = ((e.clientY - rect.top) / rect.height) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    };

    const onDown = (e: PointerEvent<SVGSVGElement>) => {
      e.preventDefault();
      (e.target as SVGElement).setPointerCapture(e.pointerId);
      drawing.current = true;
      setCurrent(`M${getPoint(e)}`);
    };
    const onMove = (e: PointerEvent<SVGSVGElement>) => {
      if (!drawing.current) return;
      setCurrent((c) => `${c} L${getPoint(e)}`);
    };
    const onUp = () => {
      if (!drawing.current) return;
      drawing.current = false;
      if (current) setStrokes((s) => [...s, current]);
      setCurrent('');
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        setStrokes([]);
        setCurrent('');
      },
      isEmpty: () => strokes.length === 0 && !current,
      toSVG: () => {
        if (strokes.length === 0) return null;
        const paths = strokes
          .map((d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`)
          .join('');
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${paths}</svg>`;
      },
    }));

    return (
      <svg
        ref={svgRef}
        className="signature-pad"
        viewBox={`0 0 ${width} ${height}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{ touchAction: 'none' }}
      >
        {strokes.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={strokeColor} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {current && (
          <path d={current} fill="none" stroke={strokeColor} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;

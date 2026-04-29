'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Line } from 'react-konva';
import useImage from 'use-image';
import { Annotation, AnnotationType } from '@/lib/types';
import Konva from 'konva';

interface Props {
  imageUrl: string;
  annotations: Annotation[];
  activeTool: AnnotationType | 'eraser';
  activeColor: string;
  onChange: (annotations: Annotation[]) => void;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AnnotationCanvas({ imageUrl, annotations, activeTool, activeColor, onChange }: Props) {
  const [image] = useImage(imageUrl, 'anonymous');
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight - 130 });
  const stageRef = useRef<Konva.Stage>(null);

  // Drawing state
  const drawing = useRef(false);
  const currentId = useRef<string | null>(null);

  // Floating text input state
  const [textInput, setTextInput] = useState<{ visible: boolean; x: number; y: number; nx: number; ny: number; value: string }>({
    visible: false, x: 0, y: 0, nx: 0, ny: 0, value: '',
  });

  useEffect(() => {
    function onResize() {
      setStageSize({ width: window.innerWidth, height: window.innerHeight - 130 });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toNorm = useCallback((px: number, py: number) => ({
    nx: px / stageSize.width,
    ny: py / stageSize.height,
  }), [stageSize]);

  const toPx = useCallback((nx: number, ny: number) => ({
    px: nx * stageSize.width,
    py: ny * stageSize.height,
  }), [stageSize]);

  function getPointer() {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return pos;
  }

  function handlePointerDown() {
    const pos = getPointer();
    if (!pos) return;
    const { nx, ny } = toNorm(pos.x, pos.y);

    if (activeTool === 'eraser') {
      // hit test: remove annotation whose bounding box contains the pointer
      const hit = annotations.slice().reverse().find(a => {
        if (a.type === 'highlight') {
          const { px, py } = toPx(a.x, a.y);
          const pw = (a.width ?? 0) * stageSize.width;
          const ph = (a.height ?? 0) * stageSize.height;
          return pos.x >= px && pos.x <= px + pw && pos.y >= py && pos.y <= py + ph;
        }
        if (a.type === 'text') {
          const { px, py } = toPx(a.x, a.y);
          return Math.abs(pos.x - px) < 60 && Math.abs(pos.y - py) < 20;
        }
        if (a.type === 'freehand' && a.points) {
          for (let i = 0; i < a.points.length - 1; i += 2) {
            const { px, py } = toPx(a.points[i], a.points[i + 1]);
            if (Math.abs(pos.x - px) < 20 && Math.abs(pos.y - py) < 20) return true;
          }
        }
        return false;
      });
      if (hit) onChange(annotations.filter(a => a.id !== hit.id));
      return;
    }

    if (activeTool === 'text') {
      setTextInput({ visible: true, x: pos.x, y: pos.y, nx, ny, value: '' });
      return;
    }

    drawing.current = true;
    const id = generateId();
    currentId.current = id;

    if (activeTool === 'highlight') {
      onChange([...annotations, { id, type: 'highlight', x: nx, y: ny, width: 0, height: 0, color: activeColor }]);
    } else if (activeTool === 'freehand') {
      onChange([...annotations, { id, type: 'freehand', x: nx, y: ny, points: [nx, ny], color: activeColor }]);
    }
  }

  function handlePointerMove() {
    if (!drawing.current || !currentId.current) return;
    const pos = getPointer();
    if (!pos) return;
    const { nx, ny } = toNorm(pos.x, pos.y);

    onChange(annotations.map(a => {
      if (a.id !== currentId.current) return a;
      if (a.type === 'highlight') {
        return { ...a, width: nx - a.x, height: ny - a.y };
      }
      if (a.type === 'freehand') {
        return { ...a, points: [...(a.points ?? []), nx, ny] };
      }
      return a;
    }));
  }

  function handlePointerUp() {
    drawing.current = false;
    currentId.current = null;
  }

  function commitText() {
    if (!textInput.value.trim()) {
      setTextInput(t => ({ ...t, visible: false }));
      return;
    }
    onChange([...annotations, {
      id: generateId(),
      type: 'text',
      x: textInput.nx,
      y: textInput.ny,
      text: textInput.value.trim(),
      color: activeColor,
    }]);
    setTextInput(t => ({ ...t, visible: false, value: '' }));
  }

  // Fit image inside stage keeping aspect ratio
  let imgW = stageSize.width;
  let imgH = stageSize.height;
  if (image) {
    const ratio = Math.min(stageSize.width / image.width, stageSize.height / image.height);
    imgW = image.width * ratio;
    imgH = image.height * ratio;
  }
  const imgX = (stageSize.width - imgW) / 2;
  const imgY = (stageSize.height - imgH) / 2;

  return (
    <div className="relative flex-1 bg-black" style={{ height: stageSize.height }}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{ cursor: activeTool === 'eraser' ? 'crosshair' : 'default' }}
      >
        <Layer>
          {image && <KonvaImage image={image} x={imgX} y={imgY} width={imgW} height={imgH} />}

          {annotations.map(a => {
            if (a.type === 'highlight') {
              const { px, py } = toPx(a.x, a.y);
              return (
                <Rect
                  key={a.id}
                  x={px} y={py}
                  width={(a.width ?? 0) * stageSize.width}
                  height={(a.height ?? 0) * stageSize.height}
                  fill={a.color}
                  opacity={0.35}
                />
              );
            }
            if (a.type === 'text' && a.text) {
              const { px, py } = toPx(a.x, a.y);
              return (
                <Text
                  key={a.id}
                  x={px} y={py}
                  text={a.text}
                  fontSize={16}
                  fill={a.color}
                  fontFamily="Manrope, sans-serif"
                  padding={4}
                />
              );
            }
            if (a.type === 'freehand' && a.points) {
              return (
                <Line
                  key={a.id}
                  points={a.points.map((v, i) => i % 2 === 0 ? v * stageSize.width : v * stageSize.height)}
                  stroke={a.color}
                  strokeWidth={3}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {textInput.visible && (
        <div
          className="absolute z-10"
          style={{ left: textInput.x, top: textInput.y - 16 }}
        >
          <input
            autoFocus
            className="bg-white/90 text-[#162b1d] text-sm px-2 py-1 rounded shadow-lg outline-none border border-[#b4cdb8] min-w-[160px]"
            placeholder="Scrivi una nota..."
            value={textInput.value}
            onChange={e => setTextInput(t => ({ ...t, value: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setTextInput(t => ({ ...t, visible: false })); }}
            onBlur={commitText}
          />
        </div>
      )}
    </div>
  );
}

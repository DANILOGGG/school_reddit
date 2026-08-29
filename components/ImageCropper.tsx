"use client";

import { useEffect, useRef, useState } from "react";

type Box = { x: number; y: number; w: number; h: number };

const VIEWPORT = 320; // максимальна ширина/висота зони обрізки на екрані

export default function ImageCropper({
  file,
  onCancel,
  onCropped,
}: {
  file: File;
  onCancel: () => void;
  onCropped: (cropped: File) => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState<Box>({ x: 0, y: 0, w: 0, h: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    startBox: Box;
  } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    let w = VIEWPORT;
    let h = VIEWPORT / ratio;
    if (h > VIEWPORT) {
      h = VIEWPORT;
      w = VIEWPORT * ratio;
    }
    setDisplaySize({ w, h });
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    const boxW = w * 0.8;
    const boxH = h * 0.8;
    setBox({ x: (w - boxW) / 2, y: (h - boxH) / 2, w: boxW, h: boxH });
  }

  function clampBox(b: Box): Box {
    const w = Math.min(Math.max(b.w, 40), displaySize.w);
    const h = Math.min(Math.max(b.h, 40), displaySize.h);
    const x = Math.min(Math.max(b.x, 0), displaySize.w - w);
    const y = Math.min(Math.max(b.y, 0), displaySize.h - h);
    return { x, y, w, h };
  }

  function startDrag(mode: "move" | "resize") {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture(e.pointerId);
      dragRef.current = { mode, startX: e.clientX, startY: e.clientY, startBox: box };
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (drag.mode === "move") {
      setBox(clampBox({ ...drag.startBox, x: drag.startBox.x + dx, y: drag.startBox.y + dy }));
    } else {
      setBox(
        clampBox({
          ...drag.startBox,
          w: drag.startBox.w + dx,
          h: drag.startBox.h + dy,
        })
      );
    }
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function applyCrop() {
    const img = imgRef.current;
    if (!img || displaySize.w === 0) return;

    const scale = natural.w / displaySize.w;
    const sx = box.x * scale;
    const sy = box.y * scale;
    const sw = box.w * scale;
    const sh = box.h * scale;

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], file.name, {
          type: file.type || "image/jpeg",
        });
        onCropped(croppedFile);
      },
      file.type || "image/jpeg",
      0.92
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4">
        <h3 className="mb-3 font-display text-lg text-paper">Обрізати фото</h3>

        {imgUrl && (
          <div
            className="relative mx-auto touch-none select-none overflow-hidden rounded-lg bg-black"
            style={{ width: displaySize.w || VIEWPORT, height: displaySize.h || VIEWPORT }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              onLoad={handleImageLoad}
              className="pointer-events-none absolute left-0 top-0 h-full w-full object-contain"
              draggable={false}
            />

            {displaySize.w > 0 && (
              <div
                onPointerDown={startDrag("move")}
                className="absolute cursor-move border-2 border-mint bg-mint/10"
                style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
              >
                <div
                  onPointerDown={startDrag("resize")}
                  className="absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize rounded-full border-2 border-base bg-mint"
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-border py-2 text-sm text-paper"
          >
            Скасувати
          </button>
          <button
            onClick={applyCrop}
            className="flex-1 rounded-full bg-chalk py-2 text-sm font-medium text-base hover:bg-mint"
          >
            Обрізати
          </button>
        </div>
      </div>
    </div>
  );
}

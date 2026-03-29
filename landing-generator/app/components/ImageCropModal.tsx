"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ImageCropModalProps {
  imageDataUrl: string;
  targetWidth: number;
  targetHeight: number;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  imageDataUrl,
  targetWidth,
  targetHeight,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0, natW: 0, natH: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState<null | "move" | "nw" | "ne" | "sw" | "se">(null);
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0, cw: 0, ch: 0 });

  const aspectRatio = targetWidth / targetHeight;

  // Initialize crop box when image loads
  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const maxW = Math.min(600, window.innerWidth - 80);
    const maxH = window.innerHeight - 200;
    let dw = img.naturalWidth;
    let dh = img.naturalHeight;

    // Scale down to fit container
    if (dw > maxW) { dh = dh * (maxW / dw); dw = maxW; }
    if (dh > maxH) { dw = dw * (maxH / dh); dh = maxH; }

    dw = Math.round(dw);
    dh = Math.round(dh);

    setImgSize({ w: dw, h: dh, natW: img.naturalWidth, natH: img.naturalHeight });

    // Initialize crop to max area preserving aspect ratio
    let cw: number, ch: number;
    if (dw / dh > aspectRatio) {
      ch = dh;
      cw = ch * aspectRatio;
    } else {
      cw = dw;
      ch = cw / aspectRatio;
    }
    setCrop({
      x: Math.round((dw - cw) / 2),
      y: Math.round((dh - ch) / 2),
      w: Math.round(cw),
      h: Math.round(ch),
    });
    setImgLoaded(true);
  }, [aspectRatio]);

  // Mouse/touch handlers
  const getPos = (e: MouseEvent | TouchEvent) => {
    const t = "touches" in e ? e.touches[0] || (e as TouchEvent).changedTouches[0] : e;
    return { mx: t.clientX, my: t.clientY };
  };

  const onPointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    type: "move" | "nw" | "ne" | "sw" | "se"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const raw = e.nativeEvent;
    const { mx, my } = getPos(raw as MouseEvent | TouchEvent);
    dragStart.current = { mx, my, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h };
    setDragging(type);
  };

  useEffect(() => {
    if (!dragging) return;
    const { cx, cy, cw, ch, mx: sx, my: sy } = dragStart.current;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const { mx, my } = getPos(e);
      const dx = mx - sx;
      const dy = my - sy;

      if (dragging === "move") {
        setCrop((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(imgSize.w - prev.w, cx + dx)),
          y: Math.max(0, Math.min(imgSize.h - prev.h, cy + dy)),
        }));
      } else {
        // Corner resize - maintain aspect ratio
        let nw = cw, nh = ch, nx = cx, ny = cy;

        if (dragging === "se") {
          nw = Math.max(40, cw + dx);
          nh = nw / aspectRatio;
        } else if (dragging === "sw") {
          nw = Math.max(40, cw - dx);
          nh = nw / aspectRatio;
          nx = cx + (cw - nw);
        } else if (dragging === "ne") {
          nw = Math.max(40, cw + dx);
          nh = nw / aspectRatio;
          ny = cy + (ch - nh);
        } else if (dragging === "nw") {
          nw = Math.max(40, cw - dx);
          nh = nw / aspectRatio;
          nx = cx + (cw - nw);
          ny = cy + (ch - nh);
        }

        // Clamp to image bounds
        if (nx < 0) { nw += nx; nh = nw / aspectRatio; nx = 0; }
        if (ny < 0) { nh += ny; nw = nh * aspectRatio; ny = 0; }
        if (nx + nw > imgSize.w) { nw = imgSize.w - nx; nh = nw / aspectRatio; }
        if (ny + nh > imgSize.h) { nh = imgSize.h - ny; nw = nh * aspectRatio; }

        if (nw >= 40 && nh >= 40) {
          setCrop({ x: Math.round(nx), y: Math.round(ny), w: Math.round(nw), h: Math.round(nh) });
        }
      }
    };

    const onUp = () => setDragging(null);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [dragging, imgSize, aspectRatio]);

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const scale = imgSize.natW / imgSize.w;
    const sx = crop.x * scale;
    const sy = crop.y * scale;
    const sw = crop.w * scale;
    const sh = crop.h * scale;

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

    onConfirm(canvas.toDataURL("image/jpeg", 0.85));
  };

  const handleStyle = (pos: "nw" | "ne" | "sw" | "se"): React.CSSProperties => {
    const size = 14;
    const base: React.CSSProperties = {
      position: "absolute",
      width: size,
      height: size,
      background: "#fff",
      border: "2px solid #3b82f6",
      borderRadius: 2,
      cursor: `${pos}-resize`,
      zIndex: 10,
    };
    if (pos.includes("n")) base.top = -size / 2;
    if (pos.includes("s")) base.bottom = -size / 2;
    if (pos.includes("w")) base.left = -size / 2;
    if (pos.includes("e")) base.right = -size / 2;
    return base;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl p-5 flex flex-col gap-4 max-w-[680px] w-full">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold">
            Recadrer l&apos;image ({targetWidth}&times;{targetHeight})
          </h3>
          <span className="text-zinc-500 text-xs">
            Ratio {(aspectRatio).toFixed(2)}:1
          </span>
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto select-none"
          style={{ width: imgSize.w || "auto", height: imgSize.h || "auto" }}
        >
          <img
            ref={imgRef}
            src={imageDataUrl}
            alt="Source"
            onLoad={onImgLoad}
            draggable={false}
            style={{ width: imgSize.w || "auto", height: imgSize.h || "auto", display: "block" }}
          />

          {imgLoaded && (
            <>
              {/* Dark overlay - top */}
              <div className="absolute left-0 right-0 top-0 bg-black/50 pointer-events-none"
                style={{ height: crop.y }} />
              {/* Dark overlay - bottom */}
              <div className="absolute left-0 right-0 bottom-0 bg-black/50 pointer-events-none"
                style={{ height: imgSize.h - crop.y - crop.h }} />
              {/* Dark overlay - left */}
              <div className="absolute left-0 bg-black/50 pointer-events-none"
                style={{ top: crop.y, height: crop.h, width: crop.x }} />
              {/* Dark overlay - right */}
              <div className="absolute right-0 bg-black/50 pointer-events-none"
                style={{ top: crop.y, height: crop.h, width: imgSize.w - crop.x - crop.w }} />

              {/* Crop area */}
              <div
                className="absolute border-2 border-blue-400"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.w,
                  height: crop.h,
                  cursor: dragging === "move" ? "grabbing" : "grab",
                }}
                onMouseDown={(e) => onPointerDown(e, "move")}
                onTouchStart={(e) => onPointerDown(e, "move")}
              >
                {/* Grid lines (rule of thirds) */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                </div>

                {/* Corner handles */}
                <div style={handleStyle("nw")} onMouseDown={(e) => onPointerDown(e, "nw")} onTouchStart={(e) => onPointerDown(e, "nw")} />
                <div style={handleStyle("ne")} onMouseDown={(e) => onPointerDown(e, "ne")} onTouchStart={(e) => onPointerDown(e, "ne")} />
                <div style={handleStyle("sw")} onMouseDown={(e) => onPointerDown(e, "sw")} onTouchStart={(e) => onPointerDown(e, "sw")} />
                <div style={handleStyle("se")} onMouseDown={(e) => onPointerDown(e, "se")} onTouchStart={(e) => onPointerDown(e, "se")} />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-zinc-500 text-xs">
            {imgSize.natW}&times;{imgSize.natH} px
          </span>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition"
            >
              Recadrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

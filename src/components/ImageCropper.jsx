"use client";

import { useEffect, useRef, useState } from "react";

export default function ImageCropper({
  src,
  originalFile,
  onCrop,
  onCancel,
}) {
  const maskRef = useRef(null);
  const imgRef = useRef(null);

  const [aspectRatio, setAspectRatio] = useState("16/10"); // "16/10", "4/3", "original"
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgDims, setImgDims] = useState(null); // { width, height }
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 });

  // Reset states when aspect ratio changes
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [aspectRatio]);

  const handleImageLoad = (e) => {
    const img = e.target;
    setImgDims({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const getAspectNumeric = () => {
    if (aspectRatio === "16/10") return 1.6;
    if (aspectRatio === "4/3") return 1.33333333;
    return 1;
  };

  const clampOffset = (ox, oy, currentZoom) => {
    if (!maskRef.current || !imgRef.current || !imgDims) {
      return { x: 0, y: 0 };
    }
    const rect = maskRef.current.getBoundingClientRect();
    const vw = rect.width;
    const vh = rect.height;

    const iw = imgDims.width;
    const ih = imgDims.height;

    const scaleX = vw / iw;
    const scaleY = vh / ih;
    const s0 = Math.max(scaleX, scaleY);

    const w = iw * s0 * currentZoom;
    const h = ih * s0 * currentZoom;

    const x0 = (vw - w) / 2;
    const y0 = (vh - h) / 2;

    const minX = vw - w - x0;
    const maxX = -x0;
    const minY = vh - h - y0;
    const maxY = -y0;

    const clampedX = w <= vw ? 0 : Math.max(minX, Math.min(maxX, ox));
    const clampedY = h <= vh ? 0 : Math.max(minY, Math.min(maxY, oy));

    return { x: clampedX, y: clampedY };
  };

  // Keep offset clamped when zoom or imgDims change
  useEffect(() => {
    if (imgDims) {
      setOffset((prev) => clampOffset(prev.x, prev.y, zoom));
    }
  }, [zoom, imgDims]);

  // Mouse Drag Events
  const handleMouseDown = (e) => {
    if (aspectRatio === "original") return;
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setOffsetStart({ x: offset.x, y: offset.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging || aspectRatio === "original") return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const newOffset = clampOffset(offsetStart.x + dx, offsetStart.y + dy, zoom);
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // Touch Drag Events (Mobile)
  const handleTouchStart = (e) => {
    if (aspectRatio === "original" || e.touches.length !== 1) return;
    setDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setOffsetStart({ x: offset.x, y: offset.y });
  };

  const handleTouchMove = (e) => {
    if (!dragging || aspectRatio === "original" || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    const newOffset = clampOffset(offsetStart.x + dx, offsetStart.y + dy, zoom);
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setDragging(false);
  };

  const handleCropClick = () => {
    if (aspectRatio === "original") {
      onCrop(originalFile);
      return;
    }

    if (!maskRef.current || !imgRef.current || !imgDims) return;

    const maskRect = maskRef.current.getBoundingClientRect();
    const vw = maskRect.width;
    const vh = maskRect.height;

    const img = imgRef.current;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scaleX = vw / iw;
    const scaleY = vh / ih;
    const s0 = Math.max(scaleX, scaleY);
    const scale = s0 * zoom;

    const w = iw * scale;
    const h = ih * scale;

    const x0 = (vw - w) / 2;
    const y0 = (vh - h) / 2;

    const left = x0 + offset.x;
    const top = y0 + offset.y;

    const cropX = -left / scale;
    const cropY = -top / scale;
    const cropW = vw / scale;
    const cropH = vh / scale;

    const canvas = document.createElement("canvas");
    const targetWidth = 1280;
    const targetHeight = Math.round(targetWidth / (vw / vh));
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetWidth, targetHeight);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], originalFile.name, {
            type: originalFile.type || "image/jpeg",
          });
          onCrop(croppedFile);
        }
      },
      originalFile.type || "image/jpeg",
      0.92
    );
  };

  // Calculate rendering styles
  let imgStyle = {
    userSelect: "none",
    pointerEvents: "none",
  };

  if (aspectRatio !== "original" && imgDims && maskRef.current) {
    const rect = maskRef.current.getBoundingClientRect();
    const vw = rect.width;
    const vh = rect.height;

    const scaleX = vw / imgDims.width;
    const scaleY = vh / imgDims.height;
    const s0 = Math.max(scaleX, scaleY);

    const w = imgDims.width * s0 * zoom;
    const h = imgDims.height * s0 * zoom;

    const x0 = (vw - w) / 2;
    const y0 = (vh - h) / 2;

    imgStyle = {
      ...imgStyle,
      position: "absolute",
      width: `${w}px`,
      height: `${h}px`,
      left: `${x0 + offset.x}px`,
      top: `${y0 + offset.y}px`,
      maxWidth: "none",
      maxHeight: "none",
    };
  } else {
    imgStyle = {
      ...imgStyle,
      maxHeight: "320px",
      width: "auto",
      height: "auto",
      objectFit: "contain",
      margin: "auto",
    };
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex w-full max-w-xl flex-col gap-5 rounded-3xl border border-white/20 bg-slate-950/90 p-5 shadow-2xl text-white sm:p-6">
        <div>
          <h2 className="text-lg font-bold sm:text-xl">Sesuaikan Gambar (Crop)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pilih aspek rasio, lalu perbesar dan geser gambar untuk menentukan area potong.
          </p>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex gap-2">
          {[
            { value: "16/10", label: "16:10 (Kartu)" },
            { value: "4/3", label: "4:3 (Detail)" },
            { value: "original", label: "Asli (Tanpa Crop)" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                aspectRatio === opt.value
                  ? "bg-white/20 border-white text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
              onClick={() => setAspectRatio(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Viewport Cropper Container */}
        <div
          ref={maskRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative mx-auto flex w-full overflow-hidden rounded-2xl bg-black/50 border border-white/15 select-none ${
            aspectRatio === "original"
              ? "h-80 items-center justify-center p-4"
              : aspectRatio === "16/10"
                ? "aspect-[1.6] cursor-move"
                : "aspect-[1.33333333] cursor-move"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="Crop target"
            onLoad={handleImageLoad}
            style={imgStyle}
            draggable={false}
          />

          {aspectRatio !== "original" && (
            <div className="pointer-events-none absolute inset-0 border-2 border-indigo-400/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] rounded-2xl" />
          )}
        </div>

        {/* Zoom Slider */}
        {aspectRatio !== "original" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-indigo-400 focus:outline-none"
            />
          </div>
        )}

        {aspectRatio === "original" && (
          <p className="text-center text-xs text-indigo-300/90 font-medium">
            Gambar asli akan disimpan sepenuhnya tanpa pemotongan.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={handleCropClick}
          >
            {aspectRatio === "original" ? "Gunakan Foto Asli" : "Terapkan Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import styles from "./ScreenshotImage.module.css";

const ZOOMS = [2, 4, 8, 16];
const INITIAL_ZOOM = 4;
const GRID_MIN_ZOOM = 8;
const LOUPE_SIZE = { min: 120, initial: 200, max: 400, keyStep: 40 };

export function ScreenshotImage({ src, alt }: { src: string; alt: string }) {
  const [loupeActive, setLoupeActive] = useState(false);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [loupeSize, setLoupeSize] = useState(LOUPE_SIZE.initial);
  const imageRef = useRef<HTMLImageElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | undefined>(undefined);

  function toggleLoupe() {
    setLoupeActive((active) => !active);
  }

  function stepZoom(step: number) {
    setZoom((current) => ZOOMS[ZOOMS.indexOf(current) + step] ?? current);
  }

  function cycleZoom() {
    setZoom((current) => ZOOMS[(ZOOMS.indexOf(current) + 1) % ZOOMS.length] ?? current);
  }

  function resizeLoupe(delta: number) {
    setLoupeSize((current) => Math.min(LOUPE_SIZE.max, Math.max(LOUPE_SIZE.min, current + delta)));
  }

  function imagePixelAtPointer() {
    const image = imageRef.current;
    const point = pointer.current;
    if (!image || !point) return undefined;
    const rect = image.getBoundingClientRect();
    // object-fit: contain letterboxes the screenshot inside the <img> box.
    const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const left = rect.left + (rect.width - image.naturalWidth * scale) / 2;
    const top = rect.top + (rect.height - image.naturalHeight * scale) / 2;
    const x = Math.floor((point.x - left) / scale);
    const y = Math.floor((point.y - top) / scale);
    if (x < 0 || y < 0 || x >= image.naturalWidth || y >= image.naturalHeight) return undefined;
    return { x, y };
  }

  function updateLoupe() {
    const image = imageRef.current;
    if (!image) return;
    const loupe = loupeRef.current;
    const point = pointer.current;
    const pixel = imagePixelAtPointer();
    image.style.cursor = pixel ? (loupe ? "none" : "zoom-in") : "";
    if (!loupe) return;
    loupe.hidden = !pixel;
    if (!point || !pixel) return;
    loupe.style.setProperty("--pointer-x", `${Math.round(point.x)}px`);
    loupe.style.setProperty("--pointer-y", `${Math.round(point.y)}px`);
    loupe.style.setProperty("--pixel-x", String(pixel.x));
    loupe.style.setProperty("--pixel-y", String(pixel.y));
    loupe.style.setProperty("--image-width", String(image.naturalWidth));
  }

  useLayoutEffect(updateLoupe);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      switch (event.key.toLowerCase()) {
        case "l":
          toggleLoupe();
          break;
        case "+":
        // Unshifted "+" key on a US layout.
        case "=":
          stepZoom(1);
          break;
        case "-":
          stepZoom(-1);
          break;
        case ".":
          resizeLoupe(LOUPE_SIZE.keyStep);
          break;
        case ",":
          resizeLoupe(-LOUPE_SIZE.keyStep);
          break;
      }
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      class={styles.image}
      // An even size keeps the loupe centre on a whole pixel.
      style={`--zoom: ${zoom}; --loupe-size: ${Math.round(loupeSize / 2) * 2}px`}
      onClick={() => {
        if (imagePixelAtPointer()) toggleLoupe();
      }}
      onPointerMove={(event) => {
        pointer.current = { x: event.clientX, y: event.clientY };
        updateLoupe();
      }}
      onPointerLeave={() => {
        pointer.current = undefined;
        updateLoupe();
      }}
      onWheel={(event) => {
        if (!loupeActive || !imagePixelAtPointer()) return;
        event.preventDefault();
        resizeLoupe(-event.deltaY);
      }}
    >
      <img ref={imageRef} alt={alt} src={src} />
      <div class={styles.controls}>
        <button
          type="button"
          aria-label="Loupe"
          aria-pressed={loupeActive}
          aria-keyshortcuts="L"
          onClick={toggleLoupe}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3.5 3.5" />
          </svg>
          <span class={styles.shortcuts} aria-hidden="true">
            Loupe <kbd>L</kbd>
            <span>Size</span> <kbd>,</kbd>
            <kbd>.</kbd>
          </span>
        </button>
        <button
          type="button"
          aria-label={`Loupe zoom ${zoom}×`}
          aria-keyshortcuts="Plus -"
          onClick={cycleZoom}
        >
          {zoom}×
          <span class={styles.shortcuts} aria-hidden="true">
            Zoom <kbd>+</kbd>
            <kbd>−</kbd>
          </span>
        </button>
      </div>
      {loupeActive && (
        <div
          ref={loupeRef}
          class={styles.loupe}
          data-grid={zoom >= GRID_MIN_ZOOM || undefined}
          aria-hidden="true"
        >
          <img alt="" src={src} />
        </div>
      )}
    </div>
  );
}

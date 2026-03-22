/**
 * Single global message listener for ALL gallery preview iframes.
 * Replaces N per-component window.addEventListener calls with one.
 * Each iframe is assigned a unique numeric ID; messages are tagged with that ID.
 */

type HeightCallback = (height: number) => void;
type ErrorCallback = (message: string) => void;

interface BusEntry {
  onHeight: HeightCallback;
  onError: ErrorCallback;
}

// id → callbacks
const registry = new Map<number, BusEntry>();
let busInitialized = false;

// Create stable IDs based on code hash
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 1000000; // Keep it reasonable size
}

function ensureBus() {
  if (busInitialized) return;
  busInitialized = true;

  window.addEventListener('message', (event: MessageEvent) => {
    const d = event.data;
    if (!d || typeof d !== 'object') return;

    // Must have our gallery tag
    if (d.__galleryId == null) return;

    console.log('[galleryBus] Received message:', { type: d.type, galleryId: d.__galleryId, height: d.height, message: d.message });

    const entry = registry.get(d.__galleryId);
    if (!entry) {
      console.warn('[galleryBus] No handler registered for galleryId:', d.__galleryId, 'registered ids:', Array.from(registry.keys()));
      return;
    }

    if (d.type === 'gallery-height' && typeof d.height === 'number') {
      console.log('[galleryBus] Calling onHeight with:', d.height);
      entry.onHeight(d.height);
    } else if (d.type === 'gallery-error' && typeof d.message === 'string') {
      console.log('[galleryBus] Calling onError with:', d.message);
      entry.onError(d.message);
    }
  });
}

export function registerGalleryIframe(
  code: string,
  onHeight: HeightCallback,
  onError: ErrorCallback
): number {
  ensureBus();
  // Use stable ID based on code content
  const id = hashCode(code);
  console.log('[galleryBus] Registering iframe with id:', id, 'based on code');
  registry.set(id, { onHeight, onError });
  return id;
}

export function unregisterGalleryIframe(id: number) {
  console.log('[galleryBus] Unregistering iframe with id:', id);
  registry.delete(id);
}
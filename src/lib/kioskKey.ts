// Each kiosk iPad is set up once: open the app at /?kiosk=<KIOSK_SECRET>, then Add to Home Screen
// from that page. The manifest has no start_url, so the Home Screen app keeps launching with the
// key in its URL (Home Screen apps on iOS do not share storage with Safari). The key is also
// stored on the device so a reload without the param keeps working.

export const KIOSK_HEADER = "x-kiosk-key";
const STORAGE_KEY = "kioskKey";

export function kioskKey(): string | null {
  const fromUrl = new URLSearchParams(window.location.search).get("kiosk");
  try {
    if (fromUrl) localStorage.setItem(STORAGE_KEY, fromUrl);
    return fromUrl ?? localStorage.getItem(STORAGE_KEY);
  } catch {
    return fromUrl;
  }
}

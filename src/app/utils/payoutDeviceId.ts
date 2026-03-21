const STORAGE_KEY = 'payoutDeviceFingerprint';

/** Stable per-browser id for payout device binding (not cross-site tracking). */
export function getPayoutDeviceFingerprint(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

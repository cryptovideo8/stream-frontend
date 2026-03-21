'use client';

import { useEffect, useRef } from 'react';
import { useTrackWatchTimeMutation } from '../store/api/payoutApi';
import { useAppSelector } from '../store/hooks';
import { selectToken } from '../store/slices/authSlice';
import { getPayoutDeviceFingerprint } from '../utils/payoutDeviceId';

const INTERVAL_MS = parseInt(process.env.NEXT_PUBLIC_PAYOUT_PING_INTERVAL_MS || '20000', 10);
const MIN_CHUNK_SECONDS = 5;

/**
 * Sends throttled watch-time heartbeats for paid/rent videos (authenticated only).
 * Uses visible wall time since last ping; server applies anti-abuse caps.
 * The elapsed time is only accumulated if the video is actively playing.
 */
export function usePayoutWatchHeartbeat(
  videoId: string | undefined,
  monetizationType: string | undefined,
  isPlaying: boolean
) {
  const token = useAppSelector(selectToken);
  const [trackWatchTime] = useTrackWatchTimeMutation();
  const lastSendRef = useRef(0);

  const eligible =
    !!token &&
    !!videoId &&
    (monetizationType === 'paid' || monetizationType === 'rent');

  useEffect(() => {
    if (!eligible) return;

    lastSendRef.current = Date.now();

    const onVisibility = () => {
      if (!document.hidden) lastSendRef.current = Date.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const tick = async () => {
      // Only count time if tab is visible AND the player is actively playing
      if (document.hidden || !isPlaying) {
        lastSendRef.current = Date.now();
        return;
      }
      
      const now = Date.now();
      const elapsed = (now - lastSendRef.current) / 1000;
      if (elapsed < MIN_CHUNK_SECONDS) return;
      const seconds = Math.min(60, elapsed);
      lastSendRef.current = now;
      try {
        await trackWatchTime({
          videoId: videoId!,
          seconds,
          deviceFingerprint: getPayoutDeviceFingerprint(),
        }).unwrap();
      } catch {
        // Avoid toast spam; payout tracking is best-effort
      }
    };

    const id = window.setInterval(tick, INTERVAL_MS);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [eligible, videoId, monetizationType, trackWatchTime, isPlaying]);
}

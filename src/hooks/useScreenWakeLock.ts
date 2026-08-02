import { useCallback, useEffect, useRef } from "react";

export function useScreenWakeLock(active: boolean): void {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockRef.current) {
      return;
    }

    const sentinel = wakeLockRef.current;
    wakeLockRef.current = null;

    try {
      await sentinel.release();
    } catch (error) {
      console.error("Failed to release screen wake lock:", error);
    }
  }, []);

  const requestWakeLock =
    useCallback(async (): Promise<WakeLockSentinel | null> => {
      if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
        return null;
      }

      try {
        return await navigator.wakeLock.request("screen");
      } catch (error) {
        console.error("Failed to acquire screen wake lock:", error);
        return null;
      }
    }, []);

  useEffect(() => {
    let cancelled = false;

    if (!active) {
      void releaseWakeLock();
      return;
    }

    void (async () => {
      const sentinel = await requestWakeLock();

      if (!sentinel) {
        return;
      }

      if (cancelled) {
        try {
          await sentinel.release();
        } catch (error) {
          console.error("Failed to release stale screen wake lock:", error);
        }
        return;
      }

      wakeLockRef.current = sentinel;
    })();

    return () => {
      cancelled = true;
      void releaseWakeLock();
    };
  }, [active, releaseWakeLock, requestWakeLock]);
}

import { lazy, Suspense, useEffect, useState } from "react";

const LazyToaster = lazy(() =>
  import("react-hot-toast").then(({ Toaster }) => ({
    default: Toaster,
  })),
);

export function DeferredToaster() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const showToaster = () => setIsReady(true);

    if ("requestIdleCallback" in window) {
      const idleCallbackId = window.requestIdleCallback(showToaster, {
        timeout: 1500,
      });

      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timeoutId = window.setTimeout(showToaster, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isReady) return null;

  return (
    <Suspense fallback={null}>
      <LazyToaster position="top-right" />
    </Suspense>
  );
}

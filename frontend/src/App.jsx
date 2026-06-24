import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";

import Router from "./router/Routers";

const BackendStatusAlert = lazy(
  () => import("./components/BackendStatusAlert"),
);

function App() {
  const [showBackendStatus, setShowBackendStatus] = useState(false);

  useEffect(() => {
    const enableBackendStatus = () => setShowBackendStatus(true);

    if ("requestIdleCallback" in window) {
      const idleCallbackId = window.requestIdleCallback(enableBackendStatus, {
        timeout: 2000,
      });

      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timeoutId = window.setTimeout(enableBackendStatus, 1000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <Router />
      {showBackendStatus ? (
        <Suspense fallback={null}>
          <BackendStatusAlert />
        </Suspense>
      ) : null}
    </>
  );
}

export default App;

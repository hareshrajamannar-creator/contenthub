import { useEffect, useMemo, useState } from "react";
import {
  MOBILE_GATE_VIEWPORT_PX,
  MOBILE_WEB_BYPASS_SESSION_KEY,
  readMobileWebGateEnabledFromEnv,
} from "@/config/mobileWebGate";

const UNLOCK_QUERY = "allow_mobile_web";

function readBypassFromSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(MOBILE_WEB_BYPASS_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Unlock from query or session; persists query unlock to sessionStorage. */
function readInitialBypassActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get(UNLOCK_QUERY) === "1") {
      sessionStorage.setItem(MOBILE_WEB_BYPASS_SESSION_KEY, "1");
      return true;
    }
  } catch {
    /* ignore */
  }
  return readBypassFromSession();
}

function isNarrowViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_GATE_VIEWPORT_PX;
}

function stripUnlockQueryFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.get(UNLOCK_QUERY) !== "1") return;
  params.delete(UNLOCK_QUERY);
  const next =
    `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", next);
}

/**
 * Applies the mobile web hard gate when the env flag is on, the viewport is narrow,
 * and QA has not unlocked the session (`?allow_mobile_web=1` or prior sessionStorage).
 */
export function useMobileWebGateActive() {
  const gateEnabledByEnv = useMemo(() => readMobileWebGateEnabledFromEnv(), []);

  const [narrowViewport, setNarrowViewport] = useState(isNarrowViewport);
  const [bypassActive] = useState(readInitialBypassActive);

  useEffect(() => {
    stripUnlockQueryFromUrl();
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_GATE_VIEWPORT_PX - 1}px)`);
    const sync = () => {
      setNarrowViewport(window.innerWidth < MOBILE_GATE_VIEWPORT_PX);
    };
    mql.addEventListener("change", sync);
    sync();
    return () => mql.removeEventListener("change", sync);
  }, []);

  const gateActive = gateEnabledByEnv && narrowViewport && !bypassActive;

  return { gateActive };
}

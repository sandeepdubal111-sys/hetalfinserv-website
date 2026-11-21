// Meta Pixel loader. Nothing is loaded or sent until the visitor clicks "Accept".
// Choice is remembered in the browser (localStorage key "hf_consent": "granted" | "denied").
export const PIXEL_ID = "1308288704255526";
const KEY = "hf_consent";

export function getConsent() {
  try { return window.localStorage.getItem(KEY); } catch (_e) { return null; }
}

export function setConsent(value) {
  try { window.localStorage.setItem(KEY, value); } catch (_e) { /* private mode: ignore */ }
  if (value === "granted") initPixel();
}

let started = false;
export function initPixel() {
  if (started || typeof window === "undefined" || getConsent() !== "granted") return;
  started = true;
  /* eslint-disable */
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

// Safe to call anywhere: does nothing unless the visitor accepted.
export function track(eventName, params) {
  if (getConsent() !== "granted" || !window.fbq) return;
  window.fbq("track", eventName, params || {});
}

export function trackPageView() {
  if (getConsent() !== "granted" || !window.fbq || !started) return;
  window.fbq("track", "PageView");
}

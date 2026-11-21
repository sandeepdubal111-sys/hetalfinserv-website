import { useEffect, useState } from "react";
import { getConsent, setConsent, initPixel } from "@/lib/tracking";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = getConsent();
    if (c === "granted") initPixel();
    if (!c) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      data-testid="consent-banner"
      className="fixed bottom-0 left-0 right-0 z-[60] bg-obsidian text-ivory border-t border-hair-light px-5 py-4 md:px-10"
    >
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(253,249,238,0.85)" }}>
          We use cookies and the Meta Pixel to understand how visitors use this site and to measure our
          advertising. Nothing is collected unless you accept. Details are in our{" "}
          <a href="/legal#privacy" className="underline">Privacy Policy</a>.
        </p>
        <div className="flex gap-3">
          <button type="button" className="hf-btn-outline" data-testid="consent-decline" onClick={() => choose("denied")}>
            Decline
          </button>
          <button type="button" className="hf-btn-coral" data-testid="consent-accept" onClick={() => choose("granted")}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

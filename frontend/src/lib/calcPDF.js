import { jsPDF } from "jspdf";

// Palette
const OBSIDIAN = "#0E0F0C";
const GOLD = "#C9A227";
const CORAL = "#F27A54";
const IVORY = "#FDF9EE";
const MUTE = "#666666";

/**
 * Renders a branded PDF of a calculator result.
 *
 * @param {object} opts
 *   config: calculator config (title, group, tagline, service)
 *   values: input values object
 *   result: computed result object ({ primary, breakdown, note, leadMessage })
 *   contactName?: optional client name for personalization
 */
export function generateCalculatorPDF({ config, values, result, contactName }) {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const now = new Date();

  // ── Header band (obsidian) ─────────────────────────────
  doc.setFillColor(OBSIDIAN);
  doc.rect(0, 0, pageW, 120, "F");

  // Brand
  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.setTextColor(IVORY);
  doc.text("Hetal Finserv", margin, 55);

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GOLD);
  doc.text("PVT. LTD.  ·  MAKE YOUR MONEY GROW", margin, 72);

  // Group + date top right
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(IVORY);
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.text(`— ${config.group.toUpperCase()}`, pageW - margin, 55, { align: "right" });
  doc.text(dateStr, pageW - margin, 72, { align: "right" });

  // ── Title ──────────────────────────────────────────────
  let y = 180;
  doc.setFont("times", "normal");
  doc.setFontSize(28);
  doc.setTextColor(OBSIDIAN);
  doc.text(config.title, margin, y);

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTE);
  const taglineLines = doc.splitTextToSize(config.tagline, pageW - margin * 2);
  doc.text(taglineLines, margin, y);
  y += taglineLines.length * 13 + 20;

  // ── Inputs table ───────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GOLD);
  doc.text("— YOUR INPUTS", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(OBSIDIAN);
  config.inputs.forEach((inp) => {
    const val = values[inp.key];
    const display = inp.format ? inp.format(val) : `${val}${inp.unit || ""}`;
    doc.setTextColor(MUTE);
    doc.text(inp.label, margin, y);
    doc.setTextColor(OBSIDIAN);
    doc.text(display, pageW - margin, y, { align: "right" });
    y += 18;
  });

  y += 14;
  doc.line(margin, y, pageW - margin, y);
  y += 24;

  // ── Primary result — big card ─────────────────────────
  const cardH = 120;
  doc.setFillColor(OBSIDIAN);
  doc.rect(margin, y, pageW - margin * 2, cardH, "F");

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GOLD);
  doc.text(`— ${result.primary.label.toUpperCase()}`, margin + 24, y + 32);

  doc.setFont("times", "normal");
  doc.setFontSize(36);
  doc.setTextColor(result.primary.tone === "coral" ? CORAL : GOLD);
  doc.text(String(result.primary.value), margin + 24, y + 82);

  y += cardH + 30;

  // ── Breakdown grid ────────────────────────────────────
  if (result.breakdown && result.breakdown.length > 0) {
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(GOLD);
    doc.text("— BREAKDOWN", margin, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    result.breakdown.forEach((b) => {
      doc.setTextColor(MUTE);
      const lbl = doc.splitTextToSize(b.label, (pageW - margin * 2) * 0.65);
      doc.text(lbl, margin, y);
      doc.setTextColor(OBSIDIAN);
      doc.setFont("times", "normal");
      doc.setFontSize(13);
      doc.text(String(b.value), pageW - margin, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y += Math.max(20, lbl.length * 12 + 4);
    });
    y += 10;
  }

  // ── Note ──────────────────────────────────────────────
  if (result.note) {
    y += 8;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageW - margin, y);
    y += 16;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(MUTE);
    const noteLines = doc.splitTextToSize(result.note, pageW - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 12 + 16;
  }

  // ── Advisor CTA strip (near bottom) ───────────────────
  const ctaY = pageH - 190;
  doc.setFillColor(CORAL);
  doc.rect(margin, ctaY, pageW - margin * 2, 82, "F");

  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.setTextColor("#FFFFFF");
  doc.text("Turn this projection into a plan.", margin + 24, ctaY + 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${contactName ? contactName + ", a" : "A"} senior advisor at Hetal Finserv will personalise it in one working day.`,
    margin + 24,
    ctaY + 52
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text("+91 87670 95307  ·  info@hetalfinserv.com  ·  hetalfinserv.com", margin + 24, ctaY + 68);

  // ── Compliance footnote ───────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(MUTE);
  const footNote =
    "AMFI Registered MFD (ARN-254254) · Regular Plans only · Investments in Mutual Funds are subject to Market Risks. Read all scheme related documents carefully. Past performance may or may not be sustained in future.";
  const footLines = doc.splitTextToSize(footNote, pageW - margin * 2);
  doc.text(footLines, margin, pageH - 60);

  doc.setFontSize(6.5);
  doc.setTextColor(180, 180, 180);
  doc.text(
    `Generated ${now.toLocaleString("en-IN")} · hetalfinserv.com`,
    margin,
    pageH - 24
  );

  const filename = `${config.slug}-hetal-finserv-${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: "Sales Enquiry - First Contact Flow",
    Author: "Holar Technologies",
    Subject: "Flow node reference documentation",
  },
});

const outPath = path.join(__dirname, "Sales-Enquiry-First-Contact-Flow.pdf");
doc.pipe(fs.createWriteStream(outPath));

const BLUE = "#2563eb";
const GRAY = "#64748b";
const DARK = "#1e293b";
const LIGHT_BG = "#f8fafc";
const BORDER = "#e2e8f0";

// ── Title page ──────────────────────────────────────────────
doc.moveDown(6);
doc
  .fontSize(28)
  .fillColor(DARK)
  .font("Helvetica-Bold")
  .text("Sales Enquiry — First Contact", { align: "center" });
doc.moveDown(0.3);
doc
  .fontSize(14)
  .fillColor(GRAY)
  .font("Helvetica")
  .text("Flow Node Reference", { align: "center" });
doc.moveDown(0.8);
doc
  .fontSize(11)
  .fillColor(GRAY)
  .text("Holar Technologies", { align: "center" });
doc.moveDown(0.1);
doc
  .fontSize(10)
  .fillColor(GRAY)
  .text("Generated: " + new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }), { align: "center" });

doc.moveDown(2);
// Metadata box
const metaX = 100;
const metaW = doc.page.width - 200;
doc.save();
doc.roundedRect(metaX, doc.y, metaW, 100, 6).fill(LIGHT_BG).stroke(BORDER);
doc.restore();
doc.moveDown(1.5);
doc.fontSize(10).fillColor(DARK).font("Helvetica-Bold");
doc.text("Flow ID", metaX + 15, doc.y, { continued: true }).font("Helvetica").fillColor(GRAY).text("  4bccf087-bcd0-485d-9ed1-6279887efab3");
doc.moveDown(0.5);
doc.font("Helvetica-Bold").fillColor(DARK).text("Status", metaX + 15, doc.y, { continued: true }).font("Helvetica").fillColor(GRAY).text("  Active");
doc.moveDown(0.5);
doc.font("Helvetica-Bold").fillColor(DARK).text("Trigger", metaX + 15, doc.y, { continued: true }).font("Helvetica").fillColor(GRAY).text("  first_inbound_message");
doc.moveDown(0.5);
doc.font("Helvetica-Bold").fillColor(DARK).text("Entry Node", metaX + 15, doc.y, { continued: true }).font("Helvetica").fillColor(GRAY).text("  start");
doc.moveDown(0.5);
doc.font("Helvetica-Bold").fillColor(DARK).text("Total Nodes", metaX + 15, doc.y, { continued: true }).font("Helvetica").fillColor(GRAY).text("  24");

doc.moveDown(2);
doc.fontSize(10).fillColor(GRAY).font("Helvetica-Oblique").text(
  "This document lists every node in the flow, its type, and its purpose.",
  { align: "center" }
);

// ── Page break ──────────────────────────────────────────────
doc.addPage();

// ── Helper: section header ──────────────────────────────────
function sectionHeader(text) {
  doc.moveDown(0.8);
  doc.fontSize(16).fillColor(BLUE).font("Helvetica-Bold").text(text);
  doc.moveDown(0.2);
  doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - 55, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
  doc.moveDown(0.4);
}

// ── Helper: node entry ──────────────────────────────────────
function nodeEntry(num, key, type, description) {
  const startX = 55;
  const colW = doc.page.width - 110;
  const needed = 70; // rough estimate of height needed

  // Check if we need a new page
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
  }

  const y0 = doc.y;

  // Number badge
  doc.save();
  doc.roundedRect(startX, y0, 24, 20, 4).fill(BLUE);
  doc.fontSize(9).fillColor("#ffffff").font("Helvetica-Bold").text(String(num), startX + 6, y0 + 5.5, { width: 12, align: "center" });
  doc.restore();

  // Node key
  doc
    .fontSize(11)
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .text(key, startX + 32, y0 + 2);

  // Type badge
  const keyWidth = doc.widthOfString(key, { font: "Helvetica-Bold", fontSize: 11 });
  doc.save();
  const badgeX = startX + 36 + keyWidth;
  doc.roundedRect(badgeX, y0 + 3, doc.widthOfString(type, { font: "Helvetica", fontSize: 8 }) + 10, 14, 3).fill(LIGHT_BG).stroke(BORDER);
  doc.fontSize(8).fillColor(GRAY).font("Helvetica").text(type, badgeX + 5, y0 + 6.5);
  doc.restore();

  doc.moveDown(0.5);

  // Description
  doc.fontSize(9.5).fillColor(DARK).font("Helvetica").text(description, startX + 32, doc.y, { width: colW - 32 });
  doc.moveDown(0.6);

  // Separator
  doc.moveTo(startX + 32, doc.y).lineTo(doc.page.width - 55, doc.y).strokeColor(BORDER).lineWidth(0.3).stroke();
  doc.moveDown(0.3);
}

// ══════════════════════════════════════════════════════════════
// SECTION 1 — Flow Path
// ══════════════════════════════════════════════════════════════
sectionHeader("1. Flow Path Overview");

doc.fontSize(9.5).fillColor(DARK).font("Helvetica").text(
  "The flow triggers on a contact's first inbound message and guides them through three main paths: " +
  "Sales qualification, Support, or Human handoff."
);
doc.moveDown(0.5);
doc.fontSize(9.5).fillColor(GRAY).font("Helvetica-Oblique").text(
  "Sales path: start → welcome → menu → services_list → service detail → qualification (×6) → qualify_tag → sales_handoff"
);
doc.moveDown(0.3);
doc.text("Support path: start → welcome → menu → support_msg → support_handoff");
doc.moveDown(0.3);
doc.text("Human path:  start → welcome → menu → human_msg → human_handoff");

// ══════════════════════════════════════════════════════════════
// SECTION 2 — All Nodes
// ══════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("2. All Nodes");

const nodes = [
  { key: "start", type: "start", desc: "Entry point of the flow. Automatically routes to the welcome node." },
  { key: "welcome", type: "send_message", desc: "Sends the greeting message with a numbered list of 8 services (web design, redesign, e-commerce, SEO, AI, custom platform, marketing, speak to team)." },
  { key: "menu", type: "send_list", desc: "Main service menu displayed as an interactive WhatsApp list. Four options: Sales (service_sales), Support (service_support), Talk to a human (service_human), Something else (service_other)." },
  { key: "services_list", type: "send_list", desc: "Detailed services sub-menu with 8 tappable rows. Each row routes to a dedicated message node with a tailored description of that service." },
  { key: "svc_web_design", type: "send_message", desc: "Sends a tailored message about Holar's web design services — building new, modern websites from scratch." },
  { key: "svc_redesign", type: "send_message", desc: "Sends a tailored message about website redesign — refreshing and improving existing websites." },
  { key: "svc_ecommerce", type: "send_message", desc: "Sends a tailored message about e-commerce and online store solutions." },
  { key: "svc_seo", type: "send_message", desc: "Sends a tailored message about SEO and Google Business Profile optimisation services." },
  { key: "svc_ai", type: "send_message", desc: "Sends a tailored message about business automation and AI-powered solutions." },
  { key: "svc_custom", type: "send_message", desc: "Sends a tailored message about custom digital platform development." },
  { key: "svc_marketing", type: "send_message", desc: "Sends a tailored message about digital marketing and branding services." },
  { key: "svc_human", type: "send_message", desc: "Sends a message offering to connect the contact with a live team member for a personalised conversation." },
  { key: "name", type: "collect_input", desc: "Collects the contact's full name. Stored in flow_runs.vars as 'name'." },
  { key: "company", type: "collect_input", desc: "Collects the contact's company or organisation name. Stored in flow_runs.vars as 'company'." },
  { key: "requirement", type: "collect_input", desc: "Collects a description of the contact's project requirement or need. Stored in flow_runs.vars as 'requirement'." },
  { key: "existing", type: "collect_input", desc: "Asks whether the contact has an existing website or platform. Stored in flow_runs.vars as 'existing'." },
  { key: "timeline", type: "collect_input", desc: "Collects the contact's project timeline. Stored in flow_runs.vars as 'timeline'." },
  { key: "budget", type: "collect_input", desc: "Collects the contact's budget range. Stored in flow_runs.vars as 'budget'." },
  { key: "qualify_tag", type: "set_tag", desc: "Tags the contact as 'qualified' (tag ID: 3dc5f9da-94a5-46cc-9515-f4784f1bad45) after all 6 qualification questions are answered." },
  { key: "sales_handoff", type: "handoff", desc: "Hands the conversation to a sales agent (assigned to fd645531-49bf-469b-98be-891b7e57c51a). Includes an internal note with all captured qualification data: Name, Company, Requirement, Existing platform, Timeline, Budget." },
  { key: "support_msg", type: "send_message", desc: "Sends a support-oriented message: 'Happy to help! Briefly, what are you running into? Our team will take it from here.'" },
  { key: "support_handoff", type: "handoff", desc: "Hands the conversation to the support team for resolution." },
  { key: "human_msg", type: "send_message", desc: "Sends a message: 'No problem — connecting you with a live agent now. They'll be with you shortly.'" },
  { key: "human_handoff", type: "handoff", desc: "Hands the conversation to a human agent for live assistance." },
];

nodes.forEach((n, i) => {
  nodeEntry(i + 1, n.key, n.type, n.desc);
});

// ══════════════════════════════════════════════════════════════
// SECTION 3 — Node Types Reference
// ══════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("3. Node Types Reference");

const typeRef = [
  { type: "start", desc: "Entry point of the flow. Exactly one per flow. The engine begins execution here." },
  { type: "send_message", desc: "Sends a plain text WhatsApp message to the contact, then advances to the next node." },
  { type: "send_list", desc: "Sends an interactive WhatsApp list message with tappable rows. Each row can route to a different next node." },
  { type: "send_buttons", desc: "Sends an interactive message with 1–3 quick-reply buttons. Each button routes to a different next node." },
  { type: "send_media", desc: "Sends an image, video, or document to the contact, optionally with a caption." },
  { type: "collect_input", desc: "Saves the contact's next reply as a variable (var_key). Used for qualification data like name, email, budget." },
  { type: "set_tag", desc: "Adds or removes a tag on the contact. Tags are used for segmentation, automation triggers, and reporting." },
  { type: "handoff", desc: "Transfers the conversation to a human agent. Can include an internal note and agent assignment." },
  { type: "condition", desc: "Branches the flow based on a rule: captured variable value, contact field, tag presence, or message content." },
  { type: "end", desc: "Terminal node. Marks the flow run as completed. No further actions." },
];

typeRef.forEach((t) => {
  doc.fontSize(11).fillColor(BLUE).font("Helvetica-Bold").text(t.type);
  doc.moveDown(0.1);
  doc.fontSize(9.5).fillColor(DARK).font("Helvetica").text(t.desc);
  doc.moveDown(0.5);
});

// ══════════════════════════════════════════════════════════════
// SECTION 4 — Tags
// ══════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("4. Tags Used in This Flow");

const tags = [
  { name: "qualified", color: "#22c55e", id: "3dc5f9da-94a5-46cc-9515-f4784f1bad45", desc: "Applied after the contact completes all 6 qualification questions. Indicates a fully qualified sales lead." },
  { name: "hot", color: "#ef4444", id: "232f31a0-0ea2-4278-b514-ddb1b53d1868", desc: "Applied when a contact selects 'Ready to buy'. Signals an immediate sales opportunity." },
  { name: "warm", color: "#f59e0b", id: "9fb5b1c4-5ecd-444a-b099-ead8a36addc7", desc: "Applied when a contact selects 'Within 3 months'. Signals a near-term opportunity." },
  { name: "nurture", color: "#3b82f6", id: "27730a67-413c-413d-98b2-aef7ed7357a2", desc: "Applied when a contact selects 'Just exploring'. Triggers a follow-up nurture sequence." },
];

tags.forEach((t) => {
  doc.fontSize(11).fillColor(DARK).font("Helvetica-Bold").text(t.name + "  ");
  doc.fontSize(9).fillColor(GRAY).font("Helvetica").text("ID: " + t.id);
  doc.moveDown(0.1);
  doc.fontSize(9.5).fillColor(DARK).font("Helvetica").text(t.desc);
  doc.moveDown(0.6);
});

doc.end();
console.log("PDF generated: " + outPath);

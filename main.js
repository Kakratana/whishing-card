"use strict";

// All drawing coordinates refer to the 1280 × 1280 source artwork.
const CARD = Object.freeze({
  width: 1280,
  height: 1280,
  nameY: 680,
  fontSize: 38,
  minFontSize: 22,
  maxTextWidth: 1080,
  fontFamily: "Moul",
  textColor: "#ff6000",
  outlineColor: "#ffffff",
  outlineWidth: 7,
  filename: "Card.png"
});

// The original Google Form is retained as an explicit, prefilled link.
// Preview does not submit it. The user reviews and submits in Google Forms.
// Set url to an empty string to hide the record-form link.
const RECORD_FORM = Object.freeze({
  url: "https://docs.google.com/forms/d/e/1FAIpQLScnM7oYJS6iz1jGM_bRP649dM_IO6KqkFNgsbCruTZ4K6Gozw/viewform",
  senderField: "entry.519597344",
  recipientField: "entry.616568867"
});

const canvas = document.getElementById("result");
const ctx = canvas.getContext("2d");
const cardForm = document.getElementById("cardForm");
const cardFields = document.getElementById("cardFields");
const nameInput = document.getElementById("inName");
const senderInput = document.getElementById("inSender");
const chkLogo = document.getElementById("chkLogo");
const background = document.getElementById("logo");
const brandLogo = document.getElementById("brandLogo");
const statusElement = document.getElementById("status");
const previewLabel = document.getElementById("previewLabel");
const badge = document.getElementById("previewBadge");
const downloadButton = document.getElementById("down");
const shareButton = document.getElementById("share");
const recordLink = document.getElementById("recordLink");

let renderedRecipient = "";
let exportBlob = null;
let exportFile = null;
let isRendering = false;
let isSharing = false;

function setStatus(message, kind = "info") {
  statusElement.textContent = message;
  statusElement.dataset.kind = kind;
}

function setExportEnabled(enabled) {
  downloadButton.disabled = !enabled;
  shareButton.disabled = !enabled;
}

function invalidatePreview() {
  exportBlob = null;
  exportFile = null;
  setExportEnabled(false);
  recordLink.hidden = true;
  if (!canvas.hidden) {
    badge.textContent = "Update preview";
    setStatus("Your details changed. Tap Preview card to update the image.");
  }
}

function updateRecordLink() {
  if (!RECORD_FORM.url || !exportBlob) {
    recordLink.hidden = true;
    return;
  }
  const url = new URL(RECORD_FORM.url);
  url.searchParams.set("usp", "pp_url");
  url.searchParams.set(RECORD_FORM.senderField, senderInput.value.trim());
  url.searchParams.set(RECORD_FORM.recipientField, renderedRecipient);
  recordLink.href = url.toString();
  recordLink.hidden = false;
}

async function waitForImage(image, label) {
  try {
    if (typeof image.decode === "function") {
      await image.decode();
    } else if (!image.complete) {
      await new Promise((resolve, reject) => {
        function cleanup() {
          image.removeEventListener("load", loaded);
          image.removeEventListener("error", failed);
        }
        function loaded() { cleanup(); resolve(); }
        function failed() { cleanup(); reject(new Error("Image load failed")); }
        image.addEventListener("load", loaded);
        image.addEventListener("error", failed);
      });
    }
    if (!image.naturalWidth) throw new Error("Empty image");
  } catch (error) {
    throw new Error(`${label} could not load. Check that all project files were uploaded together.`);
  }
}

async function waitForFont(text) {
  if (!document.fonts) {
    throw new Error("Please use a current browser to load the Khmer font correctly.");
  }
  let faces;
  try {
    faces = await document.fonts.load(`${CARD.fontSize}px "${CARD.fontFamily}"`, text);
  } catch (error) {
    throw new Error("The Moul font could not load. Check the fonts folder and reload the page.");
  }
  if (!faces.length) throw new Error("The Moul font is missing. Check the stylesheet and fonts folder.");
}

function measureName(text) {
  const metrics = ctx.measureText(text);
  // Ink bounds center the visible Khmer glyphs, including any overhangs.
  // Fall back to the advance width in browsers without bounding-box metrics.
  const left = metrics.actualBoundingBoxLeft;
  const right = metrics.actualBoundingBoxRight;
  if (Number.isFinite(left) && Number.isFinite(right) && left + right > 0) {
    return { width: left + right, left };
  }
  return { width: metrics.width, left: 0 };
}

function drawName(text) {
  ctx.save();
  try {
    ctx.direction = "ltr";
    // Work around Safari's center/right alignment issues with complex scripts.
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    let fontSize = CARD.fontSize;
    let bounds;
    do {
      ctx.font = `${fontSize}px "${CARD.fontFamily}"`;
      bounds = measureName(text);
      if (bounds.width <= CARD.maxTextWidth || fontSize === CARD.minFontSize) break;
      fontSize -= 1;
    } while (fontSize >= CARD.minFontSize);

    if (!Number.isFinite(bounds.width) || bounds.width <= 0) {
      throw new Error("Please enter a visible recipient name.");
    }
    if (bounds.width > CARD.maxTextWidth) {
      throw new Error("This name is too long for the card. Please shorten it and preview again.");
    }

    const x = (canvas.width - bounds.width) / 2 + bounds.left;
    ctx.strokeStyle = CARD.outlineColor;
    ctx.lineWidth = CARD.outlineWidth;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, CARD.nameY);
    ctx.fillStyle = CARD.textColor;
    ctx.fillText(text, x, CARD.nameY);
  } finally {
    ctx.restore();
  }
}

function canvasToBlob() {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("The image could not be created. Please try again."));
    }, "image/png");
  });
}

async function prev(event) {
  event.preventDefault();
  if (isRendering) return;
  const recipient = nameInput.value.trim();
  if (!recipient) {
    nameInput.setCustomValidity("Please enter a recipient name.");
    nameInput.reportValidity();
    return;
  }
  nameInput.setCustomValidity("");
  if (!cardForm.reportValidity()) return;

  isRendering = true;
  cardFields.disabled = true;
  cardForm.setAttribute("aria-busy", "true");
  invalidatePreview();
  previewLabel.textContent = "Preparing card…";
  setStatus("Loading the artwork and Khmer font…");

  try {
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    await Promise.all([
      waitForImage(background, "The background"),
      chkLogo.checked ? waitForImage(brandLogo, "The logo") : Promise.resolve(),
      waitForFont(recipient)
    ]);

    // Resize BEFORE setting any drawing styles: resizing resets the context.
    canvas.width = CARD.width;
    canvas.height = CARD.height;
    ctx.drawImage(background, 0, 0, CARD.width, CARD.height);
    if (chkLogo.checked) ctx.drawImage(brandLogo, 0, 0, CARD.width, CARD.height);
    drawName(recipient);

    // Prepare the PNG before the Share click so iOS retains user activation.
    exportBlob = await canvasToBlob();
    exportFile = typeof File === "function"
      ? new File([exportBlob], CARD.filename, { type: "image/png", lastModified: Date.now() })
      : null;
    renderedRecipient = recipient;
    canvas.setAttribute("aria-label", `Wishing card for ${recipient}`);
    canvas.hidden = false;
    document.getElementById("templatePreview").hidden = true;
    badge.textContent = "Ready to share";
    setExportEnabled(true);
    updateRecordLink();
    setStatus("Your card is ready. Download it or share it with someone special.", "success");
    if (window.matchMedia("(max-width: 800px)").matches) {
      document.getElementById("show").scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    }
  } catch (error) {
    exportBlob = null;
    exportFile = null;
    setExportEnabled(false);
    badge.textContent = "Preview needed";
    setStatus(error.name === "SecurityError"
      ? "Please open this project through a web server and keep the artwork on the same site."
      : (error.message || "The card could not be created. Please try again."), "error");
  } finally {
    isRendering = false;
    cardFields.disabled = false;
    cardForm.removeAttribute("aria-busy");
    previewLabel.textContent = "Preview card";
  }
}

function downloadCard() {
  if (!exportBlob) return;
  const url = URL.createObjectURL(exportBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = CARD.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Keep the URL alive while Safari starts the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  setStatus("Download started. On iPhone, you can also use Share to save to Photos.", "success");
}

async function onShares() {
  if (!exportBlob || isSharing) return;
  let canShareFile = false;
  try {
    canShareFile = Boolean(window.isSecureContext && exportFile && navigator.share &&
      navigator.canShare && navigator.canShare({ files: [exportFile] }));
  } catch (error) { /* Use the download fallback below. */ }

  if (!canShareFile) {
    downloadCard();
    setStatus("File sharing is unavailable here, so a download was started. Share the saved PNG from your device.");
    return;
  }

  isSharing = true;
  shareButton.disabled = true;
  try {
    // No font loading, fetch, or PNG conversion between the click and share().
    await navigator.share({ files: [exportFile] });
    setStatus("The image was handed to your device’s share menu.", "success");
  } catch (error) {
    if (error.name === "AbortError") setStatus("Sharing closed. Your card is still ready.");
    else setStatus("Sharing could not start. Tap Download PNG to save the card instead.", "error");
  } finally {
    isSharing = false;
    shareButton.disabled = !exportBlob;
  }
}

cardForm.addEventListener("submit", prev);
nameInput.addEventListener("input", () => {
  nameInput.setCustomValidity("");
  invalidatePreview();
});
chkLogo.addEventListener("change", invalidatePreview);
senderInput.addEventListener("input", updateRecordLink);
downloadButton.addEventListener("click", downloadCard);
shareButton.addEventListener("click", onShares);

if (!window.isSecureContext || !navigator.share || !navigator.canShare) {
  document.getElementById("shareHint").textContent =
    "If file sharing is unavailable, Share downloads the PNG for you to send from your device.";
}

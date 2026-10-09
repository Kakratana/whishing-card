# Wishing Card

A complete static website for creating a personalized Khmer wishing card.
No build step, npm packages, database, or backend is required.

## Quick start

1. Extract the entire ZIP. Keep the files and `fonts` folder together.
2. Open a terminal in the `wishing-card` folder.
3. Start a local server:

   ```sh
   python3 -m http.server 8000
   ```

   On Windows, you can use `py -m http.server 8000` instead.
   VS Code Live Server is another option.

4. Open http://localhost:8000 in your browser.
5. Enter a recipient name, choose whether to include the logos, and click
   **Preview card**. The card is generated and the sender and recipient names
   are automatically submitted to the Google Form. Then download the PNG or
   use **Share image**.

Use a web server rather than double-clicking the HTML file: local `file://`
pages can have browser-specific font and canvas export restrictions.

## Put it on your website

Upload `index.html`, `main.js`, `style.css`, both images, and the complete
`fonts` folder to the same folder on your web host. Open that folder's URL.
Keep filename capitalization exactly as supplied. Use HTTPS for sharing on
iPhone. On browsers without native file sharing, Share downloads the PNG.
No deployment has been performed for you.

## Included files

| File | Purpose |
| --- | --- |
| `index.html` | Form and responsive preview page |
| `style.css` | Layout, mobile styles, local font declarations |
| `main.js` | Card drawing, text centering, download and share |
| `CYN2025.jpg` | Your original 1280 × 1280 background |
| `Logo.png` | Your original transparent logo overlay |
| `fonts/Moul-Regular.ttf` | Card text font |
| `fonts/Siemreap.ttf` | Khmer form text font |
| `fonts/*-OFL.txt` | Font licenses |

All image generation takes place in the browser using the bundled artwork
and fonts. Automatic Google Form recording requires an internet connection.
A recording error does not prevent downloading or sharing the generated card.

## What changed

- Text is drawn with `textAlign = "left"` and a calculated x coordinate.
  Visible glyph bounds are centered at x = 640; older text-metric
  implementations fall back to measured advance width. This avoids relying
  on Safari's center alignment for complex scripts.
- The Moul font and necessary images finish loading before the name is
  measured or drawn. Missing assets show an error rather than exporting a
  silently incorrect card.
- The original name position (baseline y = 680), orange fill, white outline,
  source artwork, and logo overlay are retained.
- Long names shrink from 38 px down to 22 px to fit a 1080 px text area.
  Names that still cannot fit show a request to shorten the name.
- The output is always a 1280 × 1280 PNG. CSS scales the screen preview only.
- Changing the recipient or logo setting disables exports until you update
  the preview. You can create another card without refreshing.
- PNG conversion happens during preview, so a subsequent Share click can
  call the native share API immediately. Share cancellation is handled.
- Sender remains optional and is used for record keeping, not drawn on the
  card, matching the original canvas behavior.

## Google Form record keeping

The original Google Form address and both field IDs are retained in
`RECORD_FORM` near the top of `main.js`.

Each valid **Preview card** submission creates the image and automatically
sends a form-encoded POST to the original `/formResponse` endpoint. There is
no separate recording button or Google Form window. The fields are:

| Value | Google Form field |
| --- | --- |
| Sender name | `entry.519597344` |
| Recipient name | `entry.616568867` |

One request is sent for each successfully generated preview. Preview stays
disabled while that request is pending to prevent accidental double clicks.
Clicking Preview again after it finishes submits another response, even if
the names have not changed. Blank/invalid recipient names and failed card
generation do not submit anything. Downloads and Share do not submit again.

The request uses `fetch` with `mode: "no-cors"`, so Google Forms' response is
opaque: browser JavaScript cannot inspect its success message or HTTP status.
The page therefore says **Recording request sent**, not that saving is
confirmed. A connection error or 20-second timeout shows a recording message
while keeping the card available. No automatic retries are made because the
server may already have received the submission.

The Google Form must be open for responses and accessible without signing
in, with these field IDs and no unmet required questions. Sender is optional
in this app; if it is required in Google Forms, add `required` to `inSender`
in `index.html`. Check the form's Responses tab after your first real preview
to verify recording. Automated checks intercepted requests locally and did
not create test responses in your live Google Form.

## Customize

Edit the `CARD` object near the beginning of `main.js`:

| Setting | Default |
| --- | --- |
| `nameY` | `680` (text baseline) |
| `fontSize` | `38` |
| `minFontSize` | `22` |
| `maxTextWidth` | `1080` |
| `textColor` | `#ff6000` |
| `outlineWidth` | `7` |
| `filename` | `Card.png` |

For replacement artwork, keep a square 1280 × 1280 background. The logo image
is a full-canvas transparent overlay, not a small logo positioned by CSS.
Keep replacement images on the same origin to preserve canvas export.

## Verification

Checked in headless Chromium with desktop and 320, 375, 390, and 768 px
viewport widths. Short Khmer, long Khmer, and English names were measured
from the rendered pixels and centered at x = 640. The downloaded PNG was
verified as 1280 × 1280. Logo toggling, empty/overlong names, missing font and
image errors, export invalidation, and keyboard submission were checked.
Share activation/cancellation used a stub (no image was sent), and the
unsupported-share download fallback was checked. Automatic recording was
checked with intercepted requests, including field encoding, one POST per
preview, double-click prevention, and connection errors; no test responses
were sent to the live form. Safari/WebKit could not run in this environment because
its system dependencies were unavailable; physical iPhone testing remains.

## iPhone check

Open the hosted HTTPS page in Safari. Try a short Khmer name, a long Khmer
name, and an English name. Check that the name stays centered, toggle the
logos, preview again, then try Download and Share → Save Image. Exact share
menu options depend on iOS and installed apps. Physical iPhone verification
has not been performed in this workspace.

## Fonts and references

Moul and Siemreap come from the Google Fonts repository and are bundled with
their SIL Open Font Licenses:

- https://github.com/google/fonts/tree/main/ofl/moul
- https://github.com/google/fonts/tree/main/ofl/siemreap
- Safari complex-script alignment issue: https://bugs.webkit.org/show_bug.cgi?id=316235
- Font loading: https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load
- File sharing: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
- Cross-origin requests: https://developer.mozilla.org/en-US/docs/Web/API/Request/mode

The supplied artwork and logos remain the user's assets.

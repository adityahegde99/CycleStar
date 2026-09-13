import { toBlob } from "html-to-image";

const PNG_OPTIONS = {
  pixelRatio: 2,
  cacheBust: true,
  backgroundColor: "#09090b",
};

export interface ShareSummaryOptions {
  title: string;
  text?: string;
  filename?: string;
}

function toPngFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "velowind-summary"}.png`;
}

export async function renderSummaryPngBlob(el: HTMLElement): Promise<Blob> {
  const blob = await toBlob(el, PNG_OPTIONS);
  if (!blob) {
    throw new Error("Could not render the route summary image.");
  }
  return blob;
}

function downloadPng(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function copySummaryToClipboard(el: HTMLElement): Promise<void> {
  const blob = await renderSummaryPngBlob(el);
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}

export async function shareRouteSummary(
  el: HTMLElement,
  options: ShareSummaryOptions
): Promise<void> {
  const blob = await renderSummaryPngBlob(el);
  const filename = options.filename ?? toPngFilename(options.title);
  const file = new File([blob], filename, { type: "image/png" });

  const payload = {
    title: options.title,
    text: options.text,
    files: [file],
  };

  if (
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare(payload)
  ) {
    await navigator.share(payload);
    return;
  }

  downloadPng(blob, filename);
}

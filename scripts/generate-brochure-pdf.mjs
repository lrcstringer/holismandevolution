import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlFile = path.join(__dirname, "..", "brochure.html");
const outFile = path.join(__dirname, "..", "Holism-Rising-Brochure.pdf");

const browser = await puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();

// 2× device scale for high-DPI image rendering
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

// Load local file; networkidle0 ensures Google Fonts finish downloading
await page.goto(`file:///${htmlFile.replace(/\\/g, "/")}`, {
  waitUntil: "networkidle0",
  timeout: 30000,
});

// Ensure web fonts are fully applied before rendering
await page.evaluate(() => document.fonts.ready);

// Brief pause so any last paint completes
await new Promise((r) => setTimeout(r, 500));

await page.pdf({
  path: outFile,
  format: "A4",
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  scale: 1,
});

await browser.close();
console.log(`PDF written: ${outFile}`);

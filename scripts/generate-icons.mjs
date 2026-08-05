// يولّد أيقونات PWA (PNG) من تصميم بسيط، بدون أي اعتماد على أدوات خارجية
// غير sharp (اللي محتاج تثبته لو مش موجود: npm install -D sharp).
//
// تشغيل:
//   node scripts/generate-icons.mjs
//
// لو مش عايز تثبت sharp، بديل أسهل: افتح public/favicon.svg في أي أداة
// أونلاين لتحويل SVG إلى PNG (زي https://cloudconvert.com/svg-to-png)
// واحفظ 3 نسخ في public/icons/ بأسماء:
//   icon-192.png (192x192)
//   icon-512.png (512x512)
//   icon-maskable-512.png (512x512, نفس الصورة تكفي)

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#2F6F5E"/>
  <g transform="translate(256,256)">
    <path d="M-96 -130c32 -22 86 -26 128 0v232c-42 -26 -96 -22 -128 0v-232zM96 -130c-32 -22 -86 -26 -128 0v232c42 -26 96 -22 128 0v-232z"
      fill="none" stroke="#F7F5F1" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`.trim();

async function main() {
  const outDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "public",
    "icons"
  );
  await mkdir(outDir, { recursive: true });

  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.log(
      "sharp مش متثبت. شغّل: npm install -D sharp\nثم أعد تشغيل الأمر ده."
    );
    return;
  }

  const buf = Buffer.from(svg);
  await sharp(buf).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
  await sharp(buf).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));
  await sharp(buf)
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, "icon-maskable-512.png"));

  console.log("تم إنشاء الأيقونات في public/icons/");
}

main();

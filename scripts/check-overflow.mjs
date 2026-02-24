import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const port = 3200;
const baseUrl = `http://127.0.0.1:${port}`;
const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-360", width: 360, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url) {
  console.log(`[check-overflow] waiting for server ${url}`);
  for (let i = 0; i < 50; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // no-op
    }
    await wait(500);
  }
  throw new Error("Server not ready");
}

async function checkViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  const report = await page.evaluate(() => {
    const vw = window.innerWidth;
    const rootOverflow = document.documentElement.scrollWidth - vw;
    const offenders = [];
    const elements = Array.from(document.querySelectorAll("body *"));
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > vw + 1 || rect.left < -1) {
        const style = getComputedStyle(el);
        offenders.push({
          tag: el.tagName.toLowerCase(),
          className: el.className,
          text: (el.textContent || "").trim(),
          left: rect.left,
          right: rect.right,
          width: rect.width,
          display: style.display,
          position: style.position,
          html: el.outerHTML.slice(0, 180),
        });
      }
      if (offenders.length >= 12) break;
    }
    return { vw, rootOverflow, offenders };
  });

  console.log(`\n[${viewport.name}] vw=${report.vw} overflow=${report.rootOverflow}`);
  if (report.offenders.length === 0) {
    console.log("  no offenders");
  } else {
    for (const item of report.offenders) {
      console.log(`  - ${item.tag} ${item.className} text=\"${item.text}\" right=${item.right.toFixed(1)} left=${item.left.toFixed(1)} width=${item.width.toFixed(1)} display=${item.display} position=${item.position}`);
      console.log(`    ${item.html}`);
    }
  }

  await context.close();
}

async function main() {
  console.log("[check-overflow] launching server");
  const server = spawn("npm", ["run", "start", "--", "--port", String(port)], {
    shell: true,
    stdio: "pipe",
  });

  server.stdout.on("data", (chunk) => process.stdout.write(chunk.toString()));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk.toString()));

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });

    for (const viewport of viewports) {
      await checkViewport(browser, viewport);
    }

    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

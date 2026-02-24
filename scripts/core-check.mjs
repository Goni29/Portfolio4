import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const port = 3450 + Math.floor(Math.random() * 40);
const baseUrl = `http://127.0.0.1:${port}`;
const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-360", width: 360, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url) {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // no-op
    }
    await wait(500);
  }
  throw new Error(`Server not ready: ${url}`);
}

function log(name, step, ok, detail = "") {
  console.log(`[${name}] ${ok ? "OK" : "FAIL"} ${step}${detail ? ` - ${detail}` : ""}`);
}

async function safe(name, step, fn) {
  try {
    await fn();
    log(name, step, true);
  } catch (error) {
    log(name, step, false, String(error));
  }
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const name = viewport.name;

  await safe(name, "open home", async () => {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  });

  await safe(name, "no horizontal overflow", async () => {
    const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    if (!ok) throw new Error("overflow detected");
  });

  if (viewport.width < 1024) {
    await safe(name, "nav drawer", async () => {
      await page.getByLabel("Open menu").click();
      await page.keyboard.press("Escape");
    });
  }

  await safe(name, "shop and filter", async () => {
    await page.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded" });
    if (viewport.width < 1024) {
      await page.getByRole("button", { name: "Filter" }).click();
      await page.keyboard.press("Escape");
    }
  });

  await safe(name, "product gallery", async () => {
    await page.locator('a[href^="/product/"]').first().click();
    await page.waitForLoadState("domcontentloaded");
    const thumbs = page.locator("button").filter({ has: page.locator("img") });
    if ((await thumbs.count()) > 1) {
      await thumbs.nth(1).click();
    }
  });

  await safe(name, "add to cart and qty", async () => {
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await page.goto(`${baseUrl}/cart`, { waitUntil: "domcontentloaded" });
    const plus = page.getByLabel("Increase").first();
    if (await plus.count()) {
      await plus.click();
    }
  });

  await safe(name, "checkout complete", async () => {
    await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
    if (await page.getByText("Sign in required").count()) {
      await page.getByRole("link", { name: "Sign In" }).click();
      await page.waitForURL("**/account/**");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL("**/account");
      await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
    }

    const select = page.locator("select").first();
    if (await select.count()) {
      const options = await select.locator("option").count();
      if (options > 1) {
        await select.selectOption({ index: 1 });
      }
    }

    await page.getByRole("button", { name: "Complete Purchase" }).click();
    await page.waitForURL("**/checkout/complete**");
  });

  await safe(name, "account register", async () => {
    await page.goto(`${baseUrl}/account/register`, { waitUntil: "domcontentloaded" });
    const inputs = page.locator("input");
    await inputs.nth(0).fill(`QA ${name}`);
    await inputs.nth(1).fill(`qa_${name}_${Date.now()}@portfolio4.com`);
    await inputs.nth(2).fill("Pass1234!");
    await page.getByRole("button", { name: "Register" }).click();
    await page.waitForURL("**/account");
  });

  await context.close();
}

async function main() {
  console.log(`[core-check] start ${baseUrl}`);
  const server = spawn("npm", ["run", "start", "--", "--port", String(port)], {
    shell: true,
    stdio: "pipe",
  });

  server.stdout.on("data", (d) => process.stdout.write(d.toString()));
  server.stderr.on("data", (d) => process.stderr.write(d.toString()));

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });
    for (const viewport of viewports) {
      await runViewport(browser, viewport);
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

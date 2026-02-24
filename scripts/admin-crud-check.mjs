import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const port = 3500 + Math.floor(Math.random() * 40);
const baseUrl = `http://127.0.0.1:${port}`;

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

function log(step, ok, detail = "") {
  console.log(`[admin-check] ${ok ? "OK" : "FAIL"} ${step}${detail ? ` - ${detail}` : ""}`);
}

async function safe(step, fn) {
  try {
    await fn();
    log(step, true);
  } catch (error) {
    log(step, false, String(error));
  }
}

async function main() {
  console.log(`[admin-check] start ${baseUrl}`);
  const server = spawn("npm", ["run", "start", "--", "--port", String(port)], {
    shell: true,
    stdio: "pipe",
  });

  server.stdout.on("data", (d) => process.stdout.write(d.toString()));
  server.stderr.on("data", (d) => process.stderr.write(d.toString()));

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);

    await safe("admin login", async () => {
      await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded" });
      const inputs = page.locator("input");
      await inputs.nth(0).fill("admin@portfolio4.com");
      await inputs.nth(1).fill("Admin123!");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL("**/admin");
    });

    const nonce = Date.now().toString();

    await safe("products CRUD", async () => {
      await page.goto(`${baseUrl}/admin/products`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator("input");
      const slug = `qa-prod-${nonce}`;
      await inputs.nth(0).fill(slug);
      await inputs.nth(1).fill("QA Product");
      await inputs.nth(2).fill("QA short description");
      await inputs.nth(3).fill("49");
      await inputs.nth(4).fill("night-repair");
      await inputs.nth(5).fill("https://picsum.photos/600/800");
      await page.getByRole("button", { name: "Create" }).click();
      const row = page.locator("article", { hasText: slug }).first();
      await row.waitFor({ state: "visible" });
      await row.getByRole("button", { name: "Delete" }).click();
    });

    await safe("collections CRUD", async () => {
      await page.goto(`${baseUrl}/admin/collections`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator("input");
      const slug = `qa-col-${nonce}`;
      await inputs.nth(0).fill(slug);
      await inputs.nth(1).fill("QA Collection");
      await inputs.nth(2).fill("QA description");
      await inputs.nth(3).fill("https://picsum.photos/1200/800");
      await inputs.nth(4).fill("luminous-silk-serum");
      await inputs.nth(5).fill("90");
      await page.getByRole("button", { name: "Create" }).click();
      const row = page.locator("article", { hasText: slug }).first();
      await row.waitFor({ state: "visible" });
      await row.getByRole("button", { name: "Delete" }).click();
    });

    await safe("orders update", async () => {
      await page.goto(`${baseUrl}/admin/orders`, { waitUntil: "domcontentloaded" });
      const card = page.locator("article").first();
      await card.waitFor({ state: "visible" });
      await card.locator("select").first().selectOption("processing");
      await card.locator("input").first().fill(`TRK-${nonce}`);
      const refund = card.locator('input[type="checkbox"]').first();
      await refund.check();
    });

    await safe("reviews moderation", async () => {
      await page.goto(`${baseUrl}/admin/reviews`, { waitUntil: "domcontentloaded" });
      const approve = page.getByRole("button", { name: "Approve" }).first();
      if (await approve.count()) await approve.click();
      const del = page.getByRole("button", { name: "Delete" }).first();
      if (await del.count()) await del.click();
    });

    await safe("journal CRUD", async () => {
      await page.goto(`${baseUrl}/admin/journal`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator("input");
      const slug = `qa-article-${nonce}`;
      await inputs.nth(0).fill(slug);
      await inputs.nth(1).fill("QA Article");
      await inputs.nth(2).fill("QA excerpt");
      await inputs.nth(3).fill("https://picsum.photos/1000/600");
      await inputs.nth(4).fill("luminous-silk-serum");
      await section.locator("textarea").fill("<p>QA body</p>");
      await page.getByRole("button", { name: "Save Article" }).click();
      const row = page.locator("article", { hasText: slug }).first();
      await row.waitFor({ state: "visible" });
      await row.getByRole("button", { name: "Delete" }).click();
    });

    await safe("banners CRUD", async () => {
      await page.goto(`${baseUrl}/admin/banners`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator('input:not([type="checkbox"])');
      const id = `qa-banner-${nonce}`;
      const headline = `QA headline ${nonce}`;
      await inputs.nth(0).fill(id);
      await inputs.nth(1).fill("https://picsum.photos/1600/900");
      await inputs.nth(2).fill(headline);
      await inputs.nth(3).fill("QA subheadline");
      await inputs.nth(4).fill("Shop");
      await inputs.nth(5).fill("/shop");
      await page.getByRole("button", { name: "Save Banner" }).click();
      const row = page.locator("article", { hasText: headline }).first();
      await row.waitFor({ state: "visible" });
      await row.getByRole("button", { name: "Delete" }).click();
    });

    await safe("coupons CRUD", async () => {
      await page.goto(`${baseUrl}/admin/coupons`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator("input");
      const id = `qa-coupon-${nonce}`;
      const code = `QA${Math.floor(Math.random() * 10000)}`;
      await inputs.nth(0).fill(id);
      await inputs.nth(1).fill(code);
      await inputs.nth(2).fill("15");
      await inputs.nth(3).fill("50");
      await page.getByRole("button", { name: "Save Coupon" }).click();
      const row = page.locator("article", { hasText: code }).first();
      await row.waitFor({ state: "visible" });
      await row.getByRole("button", { name: "Delete" }).click();
    });

    await safe("settings save", async () => {
      await page.goto(`${baseUrl}/admin/settings`, { waitUntil: "domcontentloaded" });
      const first = page.locator("input").first();
      await first.fill(`Portfolio Admin QA ${nonce}`);
      await page.getByRole("button", { name: "Save Settings" }).click();
    });

    await context.close();
    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

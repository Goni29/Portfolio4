import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const port = 3600 + Math.floor(Math.random() * 30);
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
  console.log(`[smoke] ${ok ? "OK" : "FAIL"} ${step}${detail ? ` - ${detail}` : ""}`);
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
  console.log(`[smoke] start ${baseUrl}`);
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
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.clear();
    });

    await safe("shop > product > cart > checkout", async () => {
      await page.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded" });
      await page.goto(`${baseUrl}/product/luminous-silk-serum`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Add to Cart" }).click();
      await page.goto(`${baseUrl}/cart`, { waitUntil: "domcontentloaded" });
      const plus = page.getByLabel("Increase").first();
      if (await plus.count()) await plus.click();
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
        if (options > 1) await select.selectOption({ index: 1 });
      }
      await page.getByRole("button", { name: "Complete Purchase" }).click();
      await page.waitForURL("**/checkout/complete**");
    });

    await safe("account login/register", async () => {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        window.localStorage.clear();
      });
      await page.goto(`${baseUrl}/account/login`, { waitUntil: "domcontentloaded" });
      const loginInputs = page.locator("input");
      await loginInputs.nth(0).fill("user@portfolio4.com");
      await loginInputs.nth(1).fill("User123!");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL("**/account");

      await page.goto(`${baseUrl}/account/register`, { waitUntil: "domcontentloaded" });
      const regInputs = page.locator("input");
      await regInputs.nth(0).fill("Smoke User");
      await regInputs.nth(1).fill(`smoke_${Date.now()}@portfolio4.com`);
      await regInputs.nth(2).fill("Pass1234!");
      await page.getByRole("button", { name: "Register" }).click();
      await page.waitForURL("**/account");
    });

    await safe("admin login and products CRUD", async () => {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        window.localStorage.clear();
      });
      await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded" });
      const inputs = page.locator("input");
      await inputs.nth(0).fill("admin@portfolio4.com");
      await inputs.nth(1).fill("Admin123!");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL("**/admin");

      await page.goto(`${baseUrl}/admin/products`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const pInputs = section.locator("input");
      const slug = `smoke-prod-${Date.now()}`;
      await pInputs.nth(0).fill(slug);
      await pInputs.nth(1).fill("Smoke Product");
      await pInputs.nth(2).fill("Smoke description");
      await pInputs.nth(3).fill("29");
      await pInputs.nth(4).fill("night-repair");
      await pInputs.nth(5).fill("https://picsum.photos/500/700");
      await page.getByRole("button", { name: "Create" }).click();

      const card = page.locator("article", { hasText: slug }).first();
      await card.waitFor({ state: "visible" });
      await card.getByRole("button", { name: "Delete" }).click();
    });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    log("desktop no horizontal overflow", overflow);

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

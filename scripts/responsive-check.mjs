import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const port = 3333 + Math.floor(Math.random() * 50);
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
      if (res.ok) {
        return;
      }
    } catch {
      // no-op
    }
    await wait(500);
  }

  throw new Error(`Server did not start: ${url}`);
}

function logStep(name, step, ok, detail = "") {
  const marker = ok ? "OK" : "FAIL";
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`[${name}] ${marker} ${step}${suffix}`);
}

async function safeStep(name, step, fn) {
  try {
    await fn();
    logStep(name, step, true);
    return true;
  } catch (error) {
    logStep(name, step, false, String(error));
    return false;
  }
}

async function openAndCloseDrawerWithEsc(page) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
}

async function performAdminCrud(name, page) {
  await safeStep(name, "admin login", async () => {
    await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded" });
    const inputs = page.locator("input");
    await inputs.nth(0).fill("admin@portfolio4.com");
    await inputs.nth(1).fill("Admin123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/admin");
  });

  const nonce = `${name}-${Date.now()}`;

  await safeStep(name, "admin products CRUD", async () => {
    await page.goto(`${baseUrl}/admin/products`, { waitUntil: "domcontentloaded" });
    const section = page.locator("section").first();
    const inputs = section.locator("input");
    const slug = `qa-prod-${nonce}`;

    await inputs.nth(0).fill(slug);
    await inputs.nth(1).fill(`QA Product ${name}`);
    await inputs.nth(2).fill("Automated QA product");
    await inputs.nth(3).fill("39");
    await inputs.nth(4).fill("night-repair");
    await inputs.nth(5).fill("https://picsum.photos/600/800");
    await page.getByRole("button", { name: "Create" }).click();

    const target = page.locator("article", { hasText: slug }).first();
    await target.waitFor({ state: "visible", timeout: 8000 });
    await target.getByRole("button", { name: "Delete" }).click();
  });

  await safeStep(name, "admin collections CRUD", async () => {
    await page.goto(`${baseUrl}/admin/collections`, { waitUntil: "domcontentloaded" });
    const section = page.locator("section").first();
    const inputs = section.locator("input");
    const slug = `qa-collection-${nonce}`;

    await inputs.nth(0).fill(slug);
    await inputs.nth(1).fill(`QA Collection ${name}`);
    await inputs.nth(2).fill("QA collection description");
    await inputs.nth(3).fill("https://picsum.photos/1200/800");
    await inputs.nth(4).fill("luminous-silk-serum");
    await inputs.nth(5).fill("99");
    await page.getByRole("button", { name: "Create" }).click();

    const target = page.locator("article", { hasText: slug }).first();
    await target.waitFor({ state: "visible", timeout: 8000 });
    await target.getByRole("button", { name: "Delete" }).click();
  });

  await safeStep(name, "admin orders update", async () => {
    await page.goto(`${baseUrl}/admin/orders`, { waitUntil: "domcontentloaded" });
    const orderCard = page.locator("article").first();
    await orderCard.waitFor({ state: "visible", timeout: 8000 });
    const status = orderCard.locator("select").first();
    await status.selectOption("processing");
    const tracking = orderCard.locator("input").first();
    await tracking.fill(`TRK-${Date.now()}`);
    const refund = orderCard.locator('input[type="checkbox"]').first();
    await refund.check();
  });

  await safeStep(name, "admin reviews moderation", async () => {
    await page.goto(`${baseUrl}/admin/reviews`, { waitUntil: "domcontentloaded" });
    const pendingApprove = page.getByRole("button", { name: "Approve" }).first();
    if (await pendingApprove.count()) {
      await pendingApprove.click();
    }
    const deleteBtn = page.getByRole("button", { name: "Delete" }).last();
    if (await deleteBtn.count()) {
      await deleteBtn.click();
    }
  });

  await safeStep(name, "admin journal CRUD", async () => {
    await page.goto(`${baseUrl}/admin/journal`, { waitUntil: "domcontentloaded" });
    const section = page.locator("section").first();
    const inputs = section.locator("input");
    const slug = `qa-article-${nonce}`;
    await inputs.nth(0).fill(slug);
    await inputs.nth(1).fill(`QA Article ${name}`);
    await inputs.nth(2).fill("QA excerpt");
    await inputs.nth(3).fill("https://picsum.photos/1000/600");
    await inputs.nth(4).fill("luminous-silk-serum");
    await section.locator("textarea").fill("<p>QA body</p>");
    await page.getByRole("button", { name: "Save Article" }).click();

    const target = page.locator("article", { hasText: slug }).first();
    await target.waitFor({ state: "visible", timeout: 8000 });
    await target.getByRole("button", { name: "Delete" }).click();
  });

  await safeStep(name, "admin banners CRUD", async () => {
    await page.goto(`${baseUrl}/admin/banners`, { waitUntil: "domcontentloaded" });
    const section = page.locator("section").first();
    const inputs = section.locator("input");
    const id = `qa-banner-${nonce}`;
    await inputs.nth(0).fill(id);
    await inputs.nth(1).fill("https://picsum.photos/1600/900");
    await inputs.nth(2).fill(`QA Headline ${name}`);
    await inputs.nth(3).fill("QA Subheadline");
    await inputs.nth(4).fill("Shop Now");
    await inputs.nth(5).fill("/shop");
    await page.getByRole("button", { name: "Save Banner" }).click();

    const target = page.locator("article", { hasText: id }).first();
    await target.waitFor({ state: "visible", timeout: 8000 });
    await target.getByRole("button", { name: "Delete" }).click();
  });

  await safeStep(name, "admin coupons CRUD", async () => {
    await page.goto(`${baseUrl}/admin/coupons`, { waitUntil: "domcontentloaded" });
    const section = page.locator("section").first();
    const inputs = section.locator("input");
    const id = `qa-coupon-${nonce}`;
    const code = `QA${Math.floor(Math.random() * 10000)}`;
    await inputs.nth(0).fill(id);
    await inputs.nth(1).fill(code);
    await inputs.nth(2).fill("12");
    await inputs.nth(3).fill("40");
    await page.getByRole("button", { name: "Save Coupon" }).click();

    const target = page.locator("article", { hasText: code }).first();
    await target.waitFor({ state: "visible", timeout: 8000 });
    await target.getByRole("button", { name: "Delete" }).click();
  });

  await safeStep(name, "admin settings update", async () => {
    await page.goto(`${baseUrl}/admin/settings`, { waitUntil: "domcontentloaded" });
    const firstInput = page.locator("input").first();
    await firstInput.fill(`Portfolio ${name}`);
    await page.getByRole("button", { name: "Save Settings" }).click();
  });
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  const name = viewport.name;

  try {
    await safeStep(name, "home open", async () => {
      await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    });

    await safeStep(name, "no horizontal overflow", async () => {
      const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
      if (!ok) {
        throw new Error("horizontal overflow detected");
      }
    });

    if (viewport.width < 1024) {
      await safeStep(name, "nav drawer open/close", async () => {
        await page.getByLabel("Open menu").click();
        await openAndCloseDrawerWithEsc(page);
      });
    }

    await safeStep(name, "shop open", async () => {
      await page.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded" });
    });

    if (viewport.width < 1024) {
      await safeStep(name, "filter drawer open/close", async () => {
        await page.getByRole("button", { name: "Filter" }).click();
        await openAndCloseDrawerWithEsc(page);
      });
    }

    await safeStep(name, "product gallery", async () => {
      await page.locator('a[href^="/product/"]').first().click();
      await page.waitForLoadState("domcontentloaded");
      const thumbs = page.locator("button").filter({ has: page.locator("img") });
      if ((await thumbs.count()) > 1) {
        await thumbs.nth(1).click();
      }
    });

    await safeStep(name, "add to cart", async () => {
      await page.getByRole("button", { name: "Add to Cart" }).click();
    });

    await safeStep(name, "cart qty update", async () => {
      await page.goto(`${baseUrl}/cart`, { waitUntil: "domcontentloaded" });
      const plus = page.getByLabel("Increase").first();
      if (await plus.count()) {
        await plus.click();
      }
    });

    await safeStep(name, "checkout complete", async () => {
      await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
      if (await page.getByText("Sign in required").count()) {
        await page.getByRole("link", { name: "Sign In" }).click();
        await page.waitForURL("**/account/**");
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForURL("**/account");
        await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
      }

      const selects = page.locator("select");
      if ((await selects.count()) > 0) {
        const options = await selects.first().locator("option").count();
        if (options > 1) {
          await selects.first().selectOption({ index: 1 });
        }
      }

      await page.getByRole("button", { name: "Complete Purchase" }).click();
      await page.waitForURL("**/checkout/complete**");
    });

    await safeStep(name, "account register", async () => {
      await page.goto(`${baseUrl}/account/register`, { waitUntil: "domcontentloaded" });
      const inputs = page.locator("input");
      const email = `qa_${name}_${Date.now()}@portfolio4.com`;
      await inputs.nth(0).fill(`QA ${name}`);
      await inputs.nth(1).fill(email);
      await inputs.nth(2).fill("Pass1234!");
      await page.getByRole("button", { name: "Register" }).click();
      await page.waitForURL("**/account");
    });

    await performAdminCrud(name, page);
  } finally {
    await context.close();
  }
}

async function main() {
  console.log(`[responsive-check] launch server at ${baseUrl}`);
  const server = spawn("npm", ["run", "start", "--", "--port", String(port)], {
    shell: true,
    stdio: "pipe",
  });

  server.stdout.on("data", (chunk) => {
    process.stdout.write(chunk.toString());
  });
  server.stderr.on("data", (chunk) => {
    process.stderr.write(chunk.toString());
  });

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

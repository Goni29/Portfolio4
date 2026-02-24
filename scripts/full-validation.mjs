import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";

const port = 3720 + Math.floor(Math.random() * 30);
const baseUrl = `http://127.0.0.1:${port}`;

const viewports = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-360x800", width: 360, height: 800 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
];

const summary = [];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function addResult(scope, step, ok, detail = "") {
  summary.push({ scope, step, ok, detail });
  const icon = ok ? "OK" : "FAIL";
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`[${scope}] ${icon} ${step}${suffix}`);
}

async function safeStep(scope, step, fn) {
  try {
    await fn();
    addResult(scope, step, true);
    return true;
  } catch (error) {
    addResult(scope, step, false, String(error));
    return false;
  }
}

async function waitForServer(url) {
  for (let i = 0; i < 120; i += 1) {
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
  throw new Error(`Server not ready: ${url}`);
}

function startServer() {
  const server = spawn(`npm run start -- --port ${port}`, {
    shell: true,
    stdio: "pipe",
  });

  server.stdout.on("data", (chunk) => {
    process.stdout.write(chunk.toString());
  });
  server.stderr.on("data", (chunk) => {
    process.stderr.write(chunk.toString());
  });

  return server;
}

function stopServer(server) {
  if (!server || server.killed) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"]);
  } else {
    server.kill("SIGTERM");
  }
}

async function clearLocalStorage(page) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
}

async function closeAnyDrawer(page) {
  for (let i = 0; i < 5; i += 1) {
    const dialogCount = await page.locator('[role="dialog"][aria-modal="true"]').count();
    if (dialogCount === 0) {
      return;
    }

    const closeLayer = page.getByLabel("Close drawer").first();
    if ((await closeLayer.count()) > 0) {
      await closeLayer.click({ force: true });
    } else {
      await page.keyboard.press("Escape");
    }
    await page.waitForTimeout(120);
  }
}

async function assertNoDrawer(page) {
  const count = await page.locator('[role="dialog"][aria-modal="true"]').count();
  if (count > 0) {
    throw new Error("drawer is still open");
  }
}

async function assertNoOverflow(page, route, scope) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
  await closeAnyDrawer(page);
  const report = await page.evaluate(() => {
    return {
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      ok: document.documentElement.scrollWidth <= window.innerWidth + 1,
    };
  });

  if (!report.ok) {
    throw new Error(`overflow on ${route} (${report.scrollWidth} > ${report.width})`);
  }

  addResult(scope, `overflow ${route}`, true);
}

async function loginUser(page) {
  await page.goto(`${baseUrl}/account/login`, { waitUntil: "domcontentloaded" });
  const inputs = page.locator("input");
  await inputs.nth(0).fill("user@portfolio4.com");
  await inputs.nth(1).fill("User123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/account");
}

async function loginAdmin(page) {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded" });
  const inputs = page.locator("input");
  await inputs.nth(0).fill("admin@portfolio4.com");
  await inputs.nth(1).fill("Admin123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/admin");
}

async function testTouchTargets(page, scope) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const selectors = ['button[aria-label="Open menu"]', 'a[aria-label="Account"]', 'a[aria-label="Cart"]'];

  for (const selector of selectors) {
    const el = page.locator(selector).first();
    if ((await el.count()) === 0) {
      continue;
    }

    const rect = await el.evaluate((node) => {
      const r = node.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });

    if (rect.width === 0 || rect.height === 0) {
      continue;
    }

    if (rect.width < 40 || rect.height < 40) {
      throw new Error(`${selector} target is too small (${rect.width}x${rect.height})`);
    }
  }

  await page.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded" });
  const filterButton = page.getByRole("button", { name: "Filter" });
  if ((await filterButton.count()) > 0) {
    const rect = await filterButton.first().evaluate((node) => {
      const r = node.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });

    if (rect.width < 40 || rect.height < 40) {
      throw new Error(`Filter button target is too small (${rect.width}x${rect.height})`);
    }
  }

  addResult(scope, "touch target size", true);
}

async function runViewportFlow(browser, viewport) {
  const scope = `public-${viewport.name}`;
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  try {
    await safeStep(scope, "reset local storage", async () => {
      await clearLocalStorage(page);
    });

    await safeStep(scope, "open home", async () => {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await assertNoDrawer(page);
    });

    if (viewport.width < 1024) {
      await safeStep(scope, "open/close nav drawer + scroll lock", async () => {
        await page.getByLabel("Open menu").click();
        await page.locator('[role="dialog"][aria-modal="true"]').waitFor({ state: "visible" });

        const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
        if (bodyOverflow !== "hidden") {
          throw new Error(`body overflow expected hidden, got ${bodyOverflow}`);
        }

        await page.keyboard.press("Escape");
        await page.waitForTimeout(150);
        await assertNoDrawer(page);

        const restored = await page.evaluate(() => getComputedStyle(document.body).overflow);
        if (restored === "hidden") {
          throw new Error("body overflow did not restore after drawer close");
        }
      });
    }

    await safeStep(scope, "open shop", async () => {
      await page.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded" });
      await assertNoDrawer(page);
    });

    if (viewport.width < 1024) {
      await safeStep(scope, "open/close filter drawer + internal scroll", async () => {
        await page
          .locator(
            'button[aria-label="Filter"], button:has-text("Filter"), button:has-text("필터")',
          )
          .first()
          .click();
        await page.locator('[role="dialog"][aria-modal="true"]').waitFor({ state: "visible" });

        const checks = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
          const aside = dialog?.querySelector("aside");
          if (!aside) {
            return { hasAside: false, overflowY: "", canScroll: false };
          }

          const style = getComputedStyle(aside);
          const before = aside.scrollTop;
          const hasSpace = aside.scrollHeight > aside.clientHeight;
          if (hasSpace) {
            aside.scrollTop = before + 40;
          }

          return {
            hasAside: true,
            overflowY: style.overflowY,
            canScroll: hasSpace ? aside.scrollTop !== before : true,
          };
        });

        if (!checks.hasAside) {
          throw new Error("drawer aside not found");
        }
        if (!(checks.overflowY === "auto" || checks.overflowY === "scroll")) {
          throw new Error(`drawer overflowY expected auto/scroll, got ${checks.overflowY}`);
        }
        if (!checks.canScroll) {
          throw new Error("drawer internal scroll failed");
        }

        await page.keyboard.press("Escape");
        await page.waitForTimeout(150);
        await assertNoDrawer(page);
      });
    }

    await safeStep(scope, "product page and gallery", async () => {
      await closeAnyDrawer(page);
      await page.goto(`${baseUrl}/product/luminous-silk-serum`, { waitUntil: "domcontentloaded" });
      const thumbs = page.locator("button").filter({ has: page.locator("img") });
      if ((await thumbs.count()) > 1) {
        await thumbs.nth(1).click();
      }
    });

    await safeStep(scope, "add to cart + wishlist toggle", async () => {
      await page
        .locator(
          'button[aria-label="Add to Cart"], button:has-text("Add to Cart"), button:has-text("Add to Bag")',
        )
        .first()
        .click();
      const wishlist = page.getByRole("button", { name: /Wishlist/i });
      if ((await wishlist.count()) > 0) {
        await wishlist.first().click();
      }
    });

    await safeStep(scope, "cart qty + coupon", async () => {
      await page.goto(`${baseUrl}/cart`, { waitUntil: "domcontentloaded" });
      const plus = page.getByLabel("Increase").first();
      if ((await plus.count()) > 0) {
        await plus.click();
      }

      const couponInput = page.locator('input[placeholder*="WELCOME10"]').first();
      await couponInput.fill("WELCOME10");
      await page.getByRole("button", { name: "Apply" }).click();
      await page.waitForTimeout(200);
    });

    let orderId = "";
    await safeStep(scope, "checkout complete", async () => {
      await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });

      const hasCompleteButton = (await page.getByRole("button", { name: "Complete Purchase" }).count()) > 0;
      const hasLoginLink = (await page.locator('a[href="/account/login"]').count()) > 0;

      if (!hasCompleteButton && hasLoginLink) {
        await page.locator('a[href="/account/login"]').first().click();
        await page.waitForURL("**/account/login");
        await loginUser(page);
        await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
      }

      const savedAddress = page.locator("select").first();
      if ((await savedAddress.count()) > 0) {
        const optionCount = await savedAddress.locator("option").count();
        if (optionCount > 1) {
          await savedAddress.selectOption({ index: 1 });
        }
      }

      await page.getByRole("button", { name: "Complete Purchase" }).click();
      await page.waitForURL("**/checkout/complete**");
      const current = new URL(page.url());
      orderId = current.searchParams.get("orderId") ?? "";
      if (!orderId) {
        throw new Error("orderId missing on complete page");
      }
    });

    await safeStep(scope, "account orders/wishlist/addresses", async () => {
      await page.goto(`${baseUrl}/account/orders`, { waitUntil: "domcontentloaded" });
      if (page.url().includes("/account/login")) {
        await loginUser(page);
        await page.goto(`${baseUrl}/account/orders`, { waitUntil: "domcontentloaded" });
      }
      if ((await page.getByText(orderId).count()) === 0) {
        throw new Error(`order ${orderId} not found in account`);
      }

      await page.goto(`${baseUrl}/account/wishlist`, { waitUntil: "domcontentloaded" });
      if (page.url().includes("/account/login")) {
        await loginUser(page);
        await page.goto(`${baseUrl}/account/wishlist`, { waitUntil: "domcontentloaded" });
      }
      if ((await page.locator("article").count()) === 0) {
        await page.goto(`${baseUrl}/product/luminous-silk-serum`, { waitUntil: "domcontentloaded" });
        const addWishlist = page.locator('button:has-text("Wishlist"), button:has-text("위시")').first();
        if ((await addWishlist.count()) > 0) {
          await addWishlist.first().click();
        }
        await page.goto(`${baseUrl}/account/wishlist`, { waitUntil: "domcontentloaded" });
        if ((await page.locator("article").count()) === 0) {
          throw new Error("wishlist item not found");
        }
      }

      await page.goto(`${baseUrl}/account/addresses`, { waitUntil: "domcontentloaded" });
      const form = page.locator("form").last();
      const inputs = form.locator("input");
      await inputs.nth(0).fill(`QA-${viewport.name}`);
      await inputs.nth(1).fill("QA User");
      await inputs.nth(2).fill("010-1234-5678");
      await inputs.nth(3).fill("US");
      await inputs.nth(4).fill("100 QA Street");
      await inputs.nth(5).fill("Suite 1");
      await inputs.nth(6).fill("Los Angeles");
      await inputs.nth(7).fill("CA");
      await inputs.nth(8).fill("90001");
      await page
        .locator(
          'button[aria-label="Save Address"], button:has-text("Save Address"), button:has-text("주소 저장")',
        )
        .first()
        .click();
      await page.getByText(`QA-${viewport.name}`).first().waitFor({ state: "visible" });
    });

    await safeStep(scope, "routine + journal + collections pages", async () => {
      await page.goto(`${baseUrl}/routine`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Get My Routine" }).click();
      await page.locator('a[href^="/product/"]').first().waitFor({ state: "visible" });

      await page.goto(`${baseUrl}/journal`, { waitUntil: "domcontentloaded" });
      await page.locator('a[href^="/journal/"]').first().click();
      await page.waitForURL("**/journal/**");

      await page.goto(`${baseUrl}/collections`, { waitUntil: "domcontentloaded" });
      await page.goto(`${baseUrl}/collections/night-repair`, { waitUntil: "domcontentloaded" });
      await page.waitForURL("**/collections/night-repair");
      await page.locator("h1").first().waitFor({ state: "visible" });
      const productLinks = await page.locator('a[href^="/product/"]').count();
      if (productLinks === 0) {
        throw new Error("collection product links not found");
      }
    });

    await safeStep(scope, "overflow checks", async () => {
      const routes = [
        "/",
        "/shop",
        "/collections",
        "/collections/night-repair",
        "/product/luminous-silk-serum",
        "/journal",
        "/journal/the-art-of-evening-routine",
        "/about",
        "/routine",
        "/cart",
        "/checkout",
        "/account",
      ];

      for (const route of routes) {
        await assertNoOverflow(page, route, scope);
      }
    });

    await safeStep(scope, "touch target checks", async () => {
      await testTouchTargets(page, scope);
    });
  } finally {
    await context.close();
  }
}

async function runAuthGuards(browser) {
  const scope = "auth-guards";
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  try {
    await safeStep(scope, "reset local storage", async () => {
      await clearLocalStorage(page);
    });

    await safeStep(scope, "guest blocked from /admin", async () => {
      await page.goto(`${baseUrl}/admin`, { waitUntil: "domcontentloaded" });
      await page.waitForURL("**/admin/login");
    });

    await safeStep(scope, "guest blocked from /account", async () => {
      await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
      await page.waitForURL("**/account/login");
    });

    await safeStep(scope, "user blocked from /admin", async () => {
      await loginUser(page);
      await page.goto(`${baseUrl}/admin`, { waitUntil: "domcontentloaded" });
      await page.waitForURL("**/account");
    });

    await safeStep(scope, "admin redirected from /account to /admin", async () => {
      await clearLocalStorage(page);
      await loginAdmin(page);
      await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
      await page.waitForURL("**/admin");
    });
  } finally {
    await context.close();
  }
}

async function runAdminCrud(browser) {
  const scope = "admin-crud";
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const nonce = Date.now();

  try {
    await safeStep(scope, "reset local storage", async () => {
      await clearLocalStorage(page);
    });

    await safeStep(scope, "admin login", async () => {
      await loginAdmin(page);
    });

    await safeStep(scope, "products CRUD", async () => {
      await page.goto(`${baseUrl}/admin/products`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator("input");
      const slug = `qa-prod-${nonce}`;

      await inputs.nth(0).fill(slug);
      await inputs.nth(1).fill("QA Product");
      await inputs.nth(2).fill("QA product description");
      await inputs.nth(3).fill("49");
      await inputs.nth(4).fill("night-repair");
      await inputs.nth(5).fill("https://picsum.photos/700/900");
      await page.getByRole("button", { name: "Create" }).click();

      const card = page.locator("article", { hasText: slug }).first();
      await card.waitFor({ state: "visible" });
      await card.getByRole("button", { name: "Edit" }).click();
      await inputs.nth(1).fill("QA Product Updated");
      await page.getByRole("button", { name: "Update" }).click();
      await page.locator("article", { hasText: "QA Product Updated" }).first().waitFor({ state: "visible" });

      const updatedCard = page.locator("article", { hasText: slug }).first();
      await updatedCard.getByRole("button", { name: "Delete" }).click();
    });

    await safeStep(scope, "collections CRUD", async () => {
      await page.goto(`${baseUrl}/admin/collections`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator("input");
      const slug = `qa-collection-${nonce}`;

      await inputs.nth(0).fill(slug);
      await inputs.nth(1).fill("QA Collection");
      await inputs.nth(2).fill("QA collection desc");
      await inputs.nth(3).fill("https://picsum.photos/1200/700");
      await inputs.nth(4).fill("luminous-silk-serum,velvet-cloud-cream");
      await inputs.nth(5).fill("7");
      await page.getByRole("button", { name: "Create" }).click();

      const card = page.locator("article", { hasText: slug }).first();
      await card.waitFor({ state: "visible" });
      await card.getByRole("button", { name: "Edit" }).click();
      await inputs.nth(1).fill("QA Collection Updated");
      await page.getByRole("button", { name: "Update" }).click();
      await page.locator("article", { hasText: "QA Collection Updated" }).first().waitFor({ state: "visible" });
      await page.locator("article", { hasText: slug }).first().getByRole("button", { name: "Delete" }).click();
    });

    await safeStep(scope, "orders update + detail", async () => {
      await page.goto(`${baseUrl}/admin/orders`, { waitUntil: "domcontentloaded" });
      const card = page.locator("article").first();
      await card.waitFor({ state: "visible" });
      const status = card.locator("select").first();
      await status.selectOption("processing");
      const tracking = card.locator("input").first();
      await tracking.fill(`TRK-${nonce}`);
      const refund = card.locator('input[type="checkbox"]').first();
      await refund.check();

      const detailLink = card.locator('a[href^="/admin/orders/"]').first();
      await detailLink.click();
      await page.waitForURL("**/admin/orders/**");
      const paidCheckbox = page.locator('label:has-text("Paid") input[type="checkbox"]').first();
      await paidCheckbox.check();
    });

    await safeStep(scope, "customers list", async () => {
      await page.goto(`${baseUrl}/admin/customers`, { waitUntil: "domcontentloaded" });
      await page.getByText("Customers").first().waitFor({ state: "visible" });
      const cards = page.locator("article");
      if ((await cards.count()) === 0) {
        throw new Error("customer list is empty");
      }
    });

    await safeStep(scope, "reviews approve/delete", async () => {
      await page.goto(`${baseUrl}/admin/reviews`, { waitUntil: "domcontentloaded" });
      const approve = page.getByRole("button", { name: "Approve" }).first();
      if ((await approve.count()) > 0) {
        await approve.click();
      }
      const deleteBtn = page.getByRole("button", { name: "Delete" }).first();
      if ((await deleteBtn.count()) > 0) {
        await deleteBtn.click();
      } else {
        throw new Error("no review to delete");
      }
    });

    await safeStep(scope, "journal CRUD", async () => {
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

      const card = page.locator("article", { hasText: slug }).first();
      await card.waitFor({ state: "visible" });
      await card.getByRole("button", { name: "Delete" }).click();
    });

    await safeStep(scope, "banners CRUD", async () => {
      await page.goto(`${baseUrl}/admin/banners`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator('input:not([type="checkbox"])');
      const id = `qa-banner-${nonce}`;
      const headline = `QA Headline ${nonce}`;
      await inputs.nth(0).fill(id);
      await inputs.nth(1).fill("https://picsum.photos/1600/900");
      await inputs.nth(2).fill(headline);
      await inputs.nth(3).fill("QA Subheadline");
      await inputs.nth(4).fill("Shop Now");
      await inputs.nth(5).fill("/shop");
      await page.getByRole("button", { name: "Save Banner" }).click();

      const card = page.locator("article", { hasText: headline }).first();
      await card.waitFor({ state: "visible" });
      await card.getByRole("button", { name: "Delete" }).click();
    });

    await safeStep(scope, "coupons CRUD", async () => {
      await page.goto(`${baseUrl}/admin/coupons`, { waitUntil: "domcontentloaded" });
      const section = page.locator("section").first();
      const inputs = section.locator("input");
      const id = `qa-coupon-${nonce}`;
      const code = `QA${String(nonce).slice(-6)}`;
      await inputs.nth(0).fill(id);
      await inputs.nth(1).fill(code);
      await inputs.nth(2).fill("13");
      await inputs.nth(3).fill("90");
      await page.getByRole("button", { name: "Save Coupon" }).click();

      const card = page.locator("article", { hasText: code }).first();
      await card.waitFor({ state: "visible" });
      await card.getByRole("button", { name: "Delete" }).click();
    });

    await safeStep(scope, "settings save", async () => {
      await page.goto(`${baseUrl}/admin/settings`, { waitUntil: "domcontentloaded" });
      const firstInput = page.locator("input").first();
      await firstInput.fill(`Portfolio QA ${nonce}`);
      await page.getByRole("button", { name: "Save Settings" }).click();
      await page.getByText("Settings saved.").waitFor({ state: "visible" });
    });
  } finally {
    await context.close();
  }
}

function printSummaryAndExit() {
  const total = summary.length;
  const passed = summary.filter((item) => item.ok).length;
  const failed = summary.filter((item) => !item.ok);

  console.log("\n========== Validation Summary ==========");
  console.log(`Total: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\nFailed steps:");
    failed.forEach((item, index) => {
      console.log(`${index + 1}. [${item.scope}] ${item.step} - ${item.detail}`);
    });
    process.exitCode = 1;
    return;
  }

  console.log("All checks passed.");
}

async function main() {
  console.log(`[full-validation] starting ${baseUrl}`);
  const server = startServer();

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });

    for (const viewport of viewports) {
      await runViewportFlow(browser, viewport);
    }

    await runAuthGuards(browser);
    await runAdminCrud(browser);

    await browser.close();
  } finally {
    stopServer(server);
  }

  printSummaryAndExit();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

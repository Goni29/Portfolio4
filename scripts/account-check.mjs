import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const port = 3660 + Math.floor(Math.random() * 20);
const baseUrl = `http://127.0.0.1:${port}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url) {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await wait(500);
  }
  throw new Error("server not ready");
}

async function main() {
  const server = spawn("npm", ["run", "start", "--", "--port", String(port)], { shell: true, stdio: "pipe" });
  server.stdout.on("data", (d) => process.stdout.write(d.toString()));
  server.stderr.on("data", (d) => process.stderr.write(d.toString()));

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });

    const context1 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page1 = await context1.newPage();
    page1.setDefaultTimeout(12000);
    await page1.goto(`${baseUrl}/account/register`, { waitUntil: "domcontentloaded" });
    const reg = page1.locator("input");
    await reg.nth(0).fill("Account Check User");
    await reg.nth(1).fill(`account_check_${Date.now()}@portfolio4.com`);
    await reg.nth(2).fill("Pass1234!");
    await page1.getByRole("button", { name: "Register" }).click();
    await page1.waitForURL("**/account");
    console.log("[account-check] register pass");
    await context1.close();

    const context2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page2 = await context2.newPage();
    page2.setDefaultTimeout(12000);
    await page2.goto(`${baseUrl}/account/login`, { waitUntil: "domcontentloaded" });
    const login = page2.locator("input");
    await login.nth(0).fill("user@portfolio4.com");
    await login.nth(1).fill("User123!");
    await page2.getByRole("button", { name: "Sign In" }).click();
    await page2.waitForURL("**/account");
    console.log("[account-check] login pass");
    await context2.close();

    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

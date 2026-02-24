import { spawn } from "node:child_process";

const port = 3720;
const baseUrl = `http://127.0.0.1:${port}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url) {
  for (let i = 0; i < 60; i += 1) {
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
    const html = await fetch(`${baseUrl}/product/luminous-silk-serum`).then((r) => r.text());
    console.log("has Add to Cart:", html.includes("Add to Cart"));
    console.log("has Write a Review:", html.includes("Write a Review"));

    const htmlLogin = await fetch(`${baseUrl}/account/login`).then((r) => r.text());
    console.log("has Sign In form:", htmlLogin.includes("Sign In"));

    const htmlAdmin = await fetch(`${baseUrl}/admin/login`).then((r) => r.text());
    console.log("has Admin Sign In:", htmlAdmin.includes("Admin") && htmlAdmin.includes("Sign In"));
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

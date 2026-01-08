import fs from "fs";
import { chromium } from "playwright";
import "dotenv/config";

const urls = fs.readFileSync("urls.txt", "utf-8")
  .split("\n")
  .filter(line => line.trim() && !line.trim().startsWith("//"));

const browser = await chromium.launch();
const context = await browser.newContext({
  storageState: "wp-auth.json",
  viewport: { width: 1920, height: 1080 },
});

const page = await context.newPage();

// consistency
await page.addStyleTag({
  content: `
    * { animation: none !important; transition: none !important; } // Hide animations and transitions
    #wpadminbar, .notice, .update-nag { display: none !important; } // Hide WordPress elements
  `,
});

for (const line of urls) {
  // Parse line - support format: /path or /path|timeout
  const [path, customTimeout] = line.split("|");
  const waitTime = customTimeout ? parseInt(customTimeout, 10) : null;

  const url = `${process.env.WP_URL}${path}`;
  const name = path
    .replace(/\//g, "_")
    .replace(/_+$/, "") || "home";

  try {
    // Navigate to page
    await page.goto(url, { waitUntil: "domcontentloaded" });

    if (waitTime) {
      // Fixed timeout specified - wait that amount
      console.log(`⏱️  ${path} (waiting ${waitTime}ms)`);
      await page.waitForTimeout(waitTime);
    } else {
      // Try to wait for networkidle, but don't fail if it times out
      try {
        await page.waitForLoadState("networkidle", { timeout: 5000 });
      } catch {
        // Page didn't reach networkidle, but that's okay - continue anyway
        console.log(`⏱️  ${path} (didn't reach networkidle, capturing anyway)`);
      }
    }

    await page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });

    console.log(`📸 ${path}`);
  } catch (error) {
    console.error(`❌ Failed to screenshot ${path}`);
    console.error(`   Error: ${error.message}`);
    // Continue to next URL instead of stopping
  }
}

await browser.close();

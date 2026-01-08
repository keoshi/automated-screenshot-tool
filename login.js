// Note: The current implementation uses WordPress-style login (form with username/password fields).
// For other sites, you'll need to modify `login.js` to match your site's login form selectors.
// Refer to the README.md for more information.
import { chromium } from "playwright";
import "dotenv/config";

// console log the WP_URL, WP_USER, and WP_PASS
console.log("WP_URL:", process.env.WP_URL);
console.log("WP_USER:", process.env.WP_USER);
console.log("WP_PASS:", process.env.WP_PASS ? "***" : "undefined");
console.log("--------------------------------");

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${process.env.WP_URL}/wp-login.php`);
await page.fill("#user_login", process.env.WP_USER);
await page.fill("#user_pass", process.env.WP_PASS);
await page.click("#wp-submit");

console.log("Waiting for redirect to wp-admin...");
await page.waitForURL("**/wp-admin/**", { timeout: 60000 });
console.log("Current URL:", page.url());

await context.storageState({ path: "wp-auth.json" });
await browser.close();

console.log("✅ Auth saved");

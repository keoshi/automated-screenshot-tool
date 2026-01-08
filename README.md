# Automated Screenshot Tool

Batch screenshot tool for authenticated web pages using Playwright. Capture full-page screenshots of any website behind login - admin panels, dashboards, SaaS applications, or internal tools. Perfect for documentation, testing, or visual regression tracking.

## What It Does

Takes full-page screenshots of authenticated web pages automatically. Handles dynamic content, removes unwanted UI elements for consistency, and processes multiple pages in sequence with configurable wait times.

**Use Cases:**
- SaaS application screenshots for documentation
- WordPress admin panels and dashboards
- Internal tools and admin interfaces
- E-commerce backend pages
- CMS admin areas
- Any authenticated web application

## Prerequisites

- Node.js (v14 or higher)
- Access credentials for the site(s) you want to screenshot

## Installation

```bash
npm install
```

This installs:
- Playwright (with Chromium browser)
- dotenv (for environment variables)

## Setup

### 1. Configure Environment Variables

Create a `.env` file in the project root:

```env
WP_URL=https://your-site.com
WP_USER=your-username
WP_PASS=your-password
```

**Note:** The current implementation uses WordPress-style login (form with username/password fields). For other sites, you'll need to modify `login.js` to match your site's login form selectors.

### 2. Authenticate

Run the login script to save your authentication state:

```bash
node login.js
```

This creates `wp-auth.json` with your session cookies. You only need to do this once, or when your session expires.

**For non-WordPress sites:** Edit `login.js` to match your site's login flow - update the URL, form field selectors, and post-login URL pattern.

### 3. Configure URLs

Edit `urls.txt` to specify which pages to screenshot. Format:

```txt
// Basic syntax
/path/to/page

// With custom timeout (in milliseconds)
/path/to/page|3000

// Comments start with //
// This line will be ignored
```

**Examples:**
```txt
// Dashboard
/dashboard

// Analytics page with 3 second wait for charts to load
/analytics|3000

// Settings page
/settings/account

// WordPress admin examples
/wp-admin/
/wp-admin/options-general.php|2000
```

## Adapting for Other Sites

The tool currently uses WordPress login patterns. To use with other sites:

**1. Update login.js:**
- Change the login URL
- Update form field selectors (use browser DevTools to find them)
- Modify the post-login URL pattern to verify successful login

**Example for a custom site:**
```javascript
await page.goto(`${process.env.WP_URL}/login`);
await page.fill("#email", process.env.WP_USER);        // Your site's email field
await page.fill("#password", process.env.WP_PASS);    // Your site's password field
await page.click("button[type='submit']");            // Your site's submit button

// Wait for successful redirect
await page.waitForURL("**/dashboard**", { timeout: 60000 });
```

**2. Update CSS hiding rules in screenshots.js:**
- Remove WordPress-specific selectors if not needed
- Add selectors for your site's UI elements

## Usage

Run the screenshot tool:

```bash
node screenshots.js
```

**What happens:**
1. Reads URLs from `urls.txt`
2. Navigates to each page using saved authentication
3. Waits for page to load (network idle or custom timeout)
4. Takes full-page screenshot
5. Saves to `screenshots/` directory

**Screenshot naming:**
- Path: `/dashboard/analytics` → `_dashboard_analytics.png`
- Path: `/settings` → `_settings.png`
- Root: `/` → `home.png`

## Features

- **Authenticated sessions** - Access protected pages behind login
- **Full-page screenshots** - Captures entire page, not just viewport
- **Consistent output** - Removes animations and transitions for stable screenshots
- **Flexible timing** - Default network idle detection or custom timeouts per page
- **Error handling** - Continues on failure, logs errors
- **Comment support** - Organize your URL list with comments
- **Batch processing** - Process multiple pages automatically

## Customization

### Viewport Size

Edit `screenshots.js` line 12:

```javascript
viewport: { width: 1920, height: 1080 }
```

### Hidden Elements

Modify the CSS in `screenshots.js` line 18-22 to hide unwanted UI elements:

```javascript
await page.addStyleTag({
  content: `
    * { animation: none !important; transition: none !important; }
    #wpadminbar, .notice, .update-nag { display: none !important; }  // WordPress elements
    .notification-banner { display: none !important; }               // Your custom elements
    .live-chat-widget { display: none !important; }
  `,
});
```

**Common elements to hide:**
- Chat widgets, notification banners, cookie notices
- WordPress: `#wpadminbar`, `.notice`, `.update-nag`
- User-specific content (profile pictures, usernames if needed)

### Browser Options

For debugging, edit `screenshots.js` line 9:

```javascript
const browser = await chromium.launch({ headless: false }); // See browser in action
```

## Troubleshooting

**Authentication fails:**
- Verify credentials in `.env`
- Check if site requires 2FA (not supported)
- Try running `node login.js` again

**Screenshots are blank:**
- Increase timeout: `/path|5000` in `urls.txt`
- Page might require JavaScript - check console errors

**Session expired:**
- Re-run `node login.js` to refresh authentication

## File Structure

```
.
├── login.js           # Authentication script (customize for your site)
├── screenshots.js     # Main screenshot tool
├── urls.txt          # List of pages to capture
├── .env              # Site credentials (git-ignored)
├── wp-auth.json      # Saved session state (created by login.js)
└── screenshots/      # Output directory
```

## Tips

- Test with a few URLs first before running large batches
- Use custom timeouts for pages with heavy JavaScript/AJAX or dynamic charts
- Comment out URLs you don't need instead of deleting them
- Keep `wp-auth.json` secure - it contains your session cookies
- Inspect your site's login form to customize `login.js` for non-WordPress sites
- Use browser DevTools to find CSS selectors for elements you want to hide

## License

ISC

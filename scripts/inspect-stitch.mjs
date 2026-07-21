import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import Module from "node:module";

const require = createRequire(import.meta.url);
process.env.NODE_PATH =
  "C:/Users/RUPESH SHETE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/node_modules";
Module._initPaths();
const { chromium } = require(
  "C:/Users/RUPESH SHETE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const url =
  process.argv[2] ??
  "https://stitch.withgoogle.com/projects/3816741958392896080";
const screenLabel = process.argv[3];

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(10_000);

  let selectedScreen = null;
  let previewPage = null;
  if (screenLabel) {
    const projectFrame = page
      .frames()
      .find((frame) => frame.url().includes("app-companion-430619.appspot.com"));
    const screen = projectFrame?.getByText(screenLabel, { exact: true }).first();
    if (screen && (await screen.count())) {
      selectedScreen = await screen.evaluate((element) => ({
        tagName: element.tagName,
        className: element.className,
        outerHTML: element.outerHTML.slice(0, 4_000),
      }));
      await screen.click();
      await page.waitForTimeout(5_000);
      const previewButton = projectFrame.getByText("Preview", { exact: true }).first();
      if (await previewButton.count()) {
        await previewButton.click();
        await page.waitForTimeout(1_000);
        const newTabButton = projectFrame.getByText("New Tab", { exact: true }).first();
        if (await newTabButton.count()) {
          [previewPage] = await Promise.all([
            page.waitForEvent("popup"),
            newTabButton.click(),
          ]);
          await previewPage.waitForLoadState("domcontentloaded");
          await previewPage.waitForTimeout(7_000);
        }
      }
    }
  }

  const activePage = previewPage ?? page;
  const screenshot = await activePage.screenshot({
    fullPage: true,
    type: "png",
  });
  const screenshotName = screenLabel
    ? `stitch-${screenLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`
    : "stitch-project.png";
  await writeFile(screenshotName, screenshot);

  const frames = [];
  for (const frame of activePage.frames()) {
    let body = "";
    try {
      body = (await frame.locator("body").innerText()).slice(0, 20_000);
    } catch {
      body = "";
    }
    frames.push({ url: frame.url(), body });
  }

  const result = {
    title: await activePage.title(),
    url: activePage.url(),
    selectedScreen,
    body: (await activePage.locator("body").innerText()).slice(0, 20_000),
    frames,
  };

  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}

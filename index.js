require('dotenv').config();

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(process.env.QUACKING_DUCK);

  await page.type('#username', process.env.QUACKING_DUCK_USERNAME);
  await page.type('#password', process.env.QUACKING_DUCK_PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    // .pt-1 > .w-full
    page.click('.pt-1 > .w-full'),
  ]);

  // await page.screenshot({ path: 'example.png' });

  await page.exposeFunction('puppeteerMutation', (addedValues) => {
    console.log(addedValues);
  });

  await page.evaluate(() => {
    //.bg-legacy-card > .flex.flex-1 > [tabindex="0"] > div > table
    const target = document.querySelector(
      '.bg-legacy-card > .flex.flex-1 > [tabindex="0"] > div > table'
    );
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // if (mutation.type === 'childList') {
        //   puppeteerMutation();
        // }
        puppeteerMutation(mutation.addedNodes[0].innerText);
      }
    });
    observer.observe(target, { childList: true });
  });

  // start at x time set timer 23460 secs
  // await browser.close();
})();

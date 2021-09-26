require('dotenv').config();

const puppeteer = require('puppeteer');

(async () => {
  try {
    // Get this working inside a container with args
    const browser = await puppeteer.launch({
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    });
    const page = await browser.newPage();

    await page.goto(process.env.BAD_BUG);
    // await page.type('#Email', process.env.BAD_BUG_USERNAME);
    // await page.type('#Password', process.env.BAD_BUG_PASSWORD);

    // await Promise.all([
    //   page.waitForNavigation(),
    //   page.click('#loginform > div:nth-child(6) > div > button'),
    // ]);
    // await page.screenshot({ path: './images/example.png' });

    // await page.waitForSelector('#menuItemOptions', { timeout: 1000 });
    await page.click('#menuItemOptions');
    // await page.click(process.env.OWL_FILTER);
    // await page.click(process.env.OWL_FILTER_AA);
    // await page.click(process.env.OWL_FILTER_AAA);
    // await page.click(process.env.OWL_FILTERS);

    await page.exposeFunction('puppeteerMutation', (addedValues) => {
      // console.log(addedValues.split('\n'));
      console.log(addedValues);
    });

    await page.evaluate(() => {
      const target = document.querySelector('#optionsBody');

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            puppeteerMutation(mutation.addedNodes[0].textContent);
            // mutation.addedNodes[0].textContent;
          }
        }
      });

      observer.observe(target, {
        childList: true,
      });

      // start at x time set timer 23460 secs
      // await browser.close();
    });
  } catch (err) {
    console.log('Error occured...');
    console.log(err);
  }
})();

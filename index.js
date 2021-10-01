require('dotenv').config();

const WebSocket = require('ws');
const puppeteer = require('puppeteer');

const DataModifier = require('./DataModifier');

(async () => {
  try {
    const dataModifier = new DataModifier();
    const client = new WebSocket(
      `ws://${process.env.WEBSOCKET_URL}:${process.env.WEBSOCKET_PORT}`
    );

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
    await page.type('#Email', process.env.BAD_BUG_USERNAME);
    await page.type('#Password', process.env.BAD_BUG_PASSWORD);

    await Promise.all([
      page.waitForNavigation(),
      page.click('#loginform > div:nth-child(6) > div > button'),
    ]);

    await page.click('#menuItemOptions');
    await page.click(process.env.OWL_FILTER);
    await page.click(process.env.OWL_FILTER_AA);
    await page.click(process.env.OWL_FILTER_AAA);
    await page.click(process.env.OWL_FILTERS);

    await page.exposeFunction('puppeteerMutation', (rawData) => {
      const filteredData = rawData.split('\n');
      const filteredDataValid = filteredData.length > 1;

      if (filteredDataValid) {
        const dataJsonString = dataModifier.getJsonString(filteredData);

        if (dataModifier.isValidData(JSON.parse(dataJsonString))) {
          client.send(dataJsonString);
        }
      }
    });

    await page.evaluate(() => {
      const target = document.querySelector('#optionsBody');

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length) {
            puppeteerMutation(mutation.addedNodes[0].innerText);
          }
        }
      });

      observer.observe(target, {
        childList: true,
      });

      // TODO: Maybe...
      // start at x time set timer 23460 secs
      // await browser.close();
    });
  } catch (err) {
    console.log('Error occured...');
    console.log(err);
  }
})();

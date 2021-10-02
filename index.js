require('dotenv').config();

const WebSocket = require('ws');
const puppeteer = require('puppeteer');

const FlowDataModifier = require('./FlowDataModifier');
const AlertDataModifier = require('./AlertDataModifier');

const owlFlow = process.env.OWL_FLOW;
const owlAlert = process.env.OWL_ALERT;

(async () => {
  try {
    const flowDataModifier = new FlowDataModifier();
    const alertDataModifier = new AlertDataModifier();
    const websocketClient = new WebSocket(
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
    await page.waitForTimeout(3000);
    await page.click(process.env.OWL_FILTER_AA);
    await page.click(process.env.OWL_FILTER_AAA);
    await page.click(process.env.OWL_FILTERS);

    await page.exposeFunction('puppeteerMutation', (rawData) => {
      const initialFilteredData = rawData.split('\n');
      const filteredDataValid = initialFilteredData.length > 1;

      if (filteredDataValid) {
        const data =
          rawData.includes('Bullish') || rawData.includes('Bearish')
            ? getAlertData(alertDataModifier, initialFilteredData)
            : getFlowData(flowDataModifier, initialFilteredData);

        if (data !== null) {
          websocketClient.send(data);
        }
      }
    });

    await page.evaluate(
      ({ owlFlow, owlAlert }) => {
        const flowTarget = document.querySelector(owlFlow);
        const alertTarget = document.querySelector(owlAlert);

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
              puppeteerMutation(mutation.addedNodes[0].innerText);
            }
          }
        });

        observer.observe(flowTarget, {
          childList: true,
        });

        observer.observe(alertTarget, {
          childList: true,
        });

        // TODO: Maybe...
        // start at x time set timer 23460 secs
        // await browser.close();
      },
      { owlFlow, owlAlert }
    );
  } catch (err) {
    console.log('Error occured...');
    console.log(err);
  }
})();

getFlowData = (flowDataModifier, initialFilteredData) => {
  const dataJsonString = flowDataModifier.getJsonString(initialFilteredData);

  return flowDataModifier.isValidData(JSON.parse(dataJsonString))
    ? dataJsonString
    : null;
};

getAlertData = (alertDataModifier, initialFilteredData) => {
  return alertDataModifier.getJsonString(initialFilteredData);
};

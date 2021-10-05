require('dotenv').config();

const WebSocket = require('ws');
const puppeteer = require('puppeteer');

const FlowDataModifier = require('./FlowDataModifier');
const AlertDataModifier = require('./AlertDataModifier');

const Config = require('./config.json');

const owlFlow = process.env.OWL_FLOW;
const owlAlert = process.env.OWL_ALERT;

let websocketClient;
let flowDataModifier;
let alertDataModifier;

// Get this working inside a container with args
const puppeteerLaunchArgs = [
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-setuid-sandbox',
  '--no-sandbox',
];

(async () => {
  try {
    websocketClient = new WebSocket(
      `ws://${process.env.WEBSOCKET_URL}:${process.env.WEBSOCKET_PORT}`
    );
    flowDataModifier = new FlowDataModifier();
    alertDataModifier = new AlertDataModifier();
  } catch (err) {
    console.log('Error occured...');
    console.log(err);
  }
})();

(async () => {
  try {
    const browser = await puppeteer.launch({
      args: puppeteerLaunchArgs,
    });
    const page = await browser.newPage();

    await page.goto(process.env.BAD_BUG);

    if (process.env.MODE === 'PROD') {
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
    }

    await page.exposeFunction('puppeteerMutation', (rawData) => {
      handleData(rawData);
    });

    await page.evaluate(
      ({ owlFlow }) => {
        const flowTarget = document.querySelector(owlFlow);

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
      },
      { owlFlow }
    );
  } catch (err) {
    console.log('Error occured...');
    console.log(err);
  }
})();

(async () => {
  try {
    const browser = await puppeteer.launch({
      args: puppeteerLaunchArgs,
    });
    const page = await browser.newPage();

    await page.goto(process.env.BAD_BUG_ALERTS);

    if (process.env.MODE === 'PROD') {
      await page.type('#Email', process.env.BAD_BUG_USERNAME);
      await page.type('#Password', process.env.BAD_BUG_PASSWORD);

      await Promise.all([
        page.waitForNavigation(),
        page.click('#loginform > div:nth-child(6) > div > button'),
      ]);

      await page.click('#menuItemOptions');
      await page.waitForTimeout(3000);
      await page.click(process.env.OWL_ALERT_BTN);
    }

    await page.exposeFunction('alertsData', (rawData) => {
      handleData(rawData);
    });

    await page.evaluate(
      ({ owlAlert }) => {
        const alertTarget = document.querySelector(owlAlert);
        const alerts = [];

        // Had issues with mutation observer, browser tabs, and elements that updated with dynamic data.
        setInterval(() => {
          const alertsRawData = alertTarget.innerText.split('\n');

          alertsRawData.forEach((alert) => {
            if (!alerts.includes(alert)) {
              alerts.push(alert);
              alertsData(alert);
            }
          });
        }, 1000);
      },
      { owlAlert }
    );
  } catch (err) {
    console.log('Error occured...');
    console.log(err);
  }
})();

const handleData = (rawData) => {
  const rawDataUpper = rawData.toUpperCase();
  let initialFilterData = [];

  if (process.env.MODE === 'PROD') {
    initialFilteredData = rawDataUpper.split('\n');
  } else {
    initialFilteredData = rawDataUpper.replace(/\t/g, '\n').split('\n');
  }

  const filteredDataValid = initialFilteredData.length > 1;

  if (filteredDataValid) {
    const data =
      rawData.includes('Bullish') || rawData.includes('Bearish')
        ? getAlertData(alertDataModifier, initialFilteredData)
        : getFlowData(flowDataModifier, initialFilteredData);

    if (data !== null) {
      console.log(data); // TODO: Remove, but lets keep this here for a bit
      websocketClient.send(data);
    }
  }
};

getFlowData = (flowDataModifier, initialFilteredData) => {
  const dataJsonString = flowDataModifier.getJsonString(initialFilteredData);

  return flowDataModifier.isValidData(JSON.parse(dataJsonString))
    ? dataJsonString
    : null;
};

getAlertData = (alertDataModifier, initialFilteredData) => {
  return alertDataModifier.getJsonString(initialFilteredData);
};

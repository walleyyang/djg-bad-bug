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

// Flow
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
      handleData(splitData(rawData));
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

// Alerts
(async () => {
  try {
    const browser = await puppeteer.launch({
      args: puppeteerLaunchArgs,
    });
    const page = await browser.newPage();
    const alerts = [];

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

    await page.exposeFunction('alertsData', (formattedRawData) => {
      const alertIdIndex = 10;

      formattedRawData.forEach((alert) => {
        const data = splitData(alert);

        // Make sure we are not already keeping track of the id
        if (!alerts.includes(data[alertIdIndex])) {
          alerts.push(data[alertIdIndex]);
          handleData(data);
        }
      });
    });

    await page.evaluate(
      ({ owlAlert }) => {
        const alertTarget = document.querySelector(owlAlert);

        // Had issues with mutation observer, browser tabs, and elements that updated with dynamic data.
        // So we will just check it every so often
        setInterval(() => {
          // Body shows empty rows, but splitting it shows value for some reason
          const alertsRawData = alertTarget.innerHTML.split('</tr>');
          // Last row is div
          alertsRawData.pop();

          // Create a new table with rows that contains data
          let newTableString = '<table><tbody>';
          const tableEnd = '</tbody></table>';

          alertsRawData.forEach((alert) => {
            newTableString += alert;
          });

          newTableString += tableEnd;

          // Create a new table to append a new line so we can easily identify and split the data
          const html = new DOMParser().parseFromString(
            newTableString,
            'text/html'
          );

          const newTableBody = html.getElementsByTagName('tbody')[0];
          const formattedRawData = [];

          newTableBody.childNodes.forEach((row) => {
            const id = row.getAttribute('d-symbol');
            let formattedCell = '';

            row.childNodes.forEach((cell, idx, array) => {
              if (idx === array.length - 1) {
                formattedCell += cell.innerText + '\n' + id;
              } else {
                formattedCell += cell.innerText + '\n';
              }
            });

            formattedRawData.push(formattedCell);
          });

          // Finally have the formatted data we need
          alertsData(formattedRawData);
        }, 1000);
      },
      { owlAlert }
    );
  } catch (err) {
    console.log('Error occured...');
    console.log(err);
  }
})();

const splitData = (rawData) => {
  const rawDataUpper = rawData.toUpperCase();
  let splitData = [];

  if (process.env.MODE === 'PROD') {
    splitData = rawDataUpper.split('\n');
  } else {
    splitData = rawDataUpper.replace(/\t/g, '\n').split('\n');
  }

  return splitData;
};

const handleData = (splitData) => {
  const alertSentimentIndex = 5;

  if (splitData.length > 1) {
    const data =
      splitData[alertSentimentIndex].includes('BULLISH') ||
      splitData[alertSentimentIndex].includes('BEARISH')
        ? getAlertData(alertDataModifier, splitData)
        : getFlowData(flowDataModifier, splitData);

    if (data !== null) {
      websocketClient.send(data);
    }
  }
};

const getFlowData = (flowDataModifier, splitData) => {
  const dataJsonString = flowDataModifier.getJsonString(splitData);

  return flowDataModifier.isValidData(JSON.parse(dataJsonString))
    ? dataJsonString
    : null;
};

const getAlertData = (alertDataModifier, splitData) => {
  return alertDataModifier.getJsonString(splitData);
};

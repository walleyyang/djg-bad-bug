import puppeteer from 'puppeteer';
import 'dotenv/config';

import { modifier } from 'modifiers/modifier';
import { Environment } from 'modifiers/enums';
import { sendMessage } from 'messageHandler';
import { mode, urlAlerts, username, password, owlAlert, owlAlertBtn, timeout } from 'watcherConstants';

const alertWatcher = () => {
  // Get this working inside a container with args
  const puppeteerLaunchArgs = ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const launcher = (async () => {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        args: puppeteerLaunchArgs,
      });
      const page = await browser.newPage();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const puppeteerMutation = (rawData: string) => '';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const getNewTableString = (alertTarget: HTMLElement) => '';
      const alerts = [];

      await page.goto(urlAlerts);

      if (mode === Environment.PROD) {
        await page.type('#Email', username);
        await page.type('#Password', password);

        await Promise.all([page.waitForNavigation(), page.click('#loginform > div:nth-child(6) > div > button')]);

        await page.click('#menuItemOptions');
        await page.waitForTimeout(timeout);
        await page.click(owlAlertBtn);
      }

      await page.exposeFunction('puppeteerMutation', (rawData: string[]) => {
        const alertIdIndex = 10;

        rawData.forEach((alert) => {
          // void sendMessage(modifier(rawData));
          // const data = splitData(alert);
          // // Make sure we are not already keeping track of the id
          // if (!alerts.includes(data[alertIdIndex])) {
          //   alerts.push(data[alertIdIndex]);
          //   handleData(data);
          // }
        });
      });

      await page.exposeFunction('getNewTableString', (alertTarget: HTMLElement) => {
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

        return (newTableString += tableEnd);
      });

      await page.evaluate(
        ({ owlAlert }) => {
          const alertTarget = document.querySelector(owlAlert) as HTMLElement;

          // Had issues with mutation observer, browser tabs, and elements that updated with dynamic data.
          // So we will just check it every so often
          setInterval(() => {
            // Create a new table to append a new line so we can easily identify and split the data
            const html = new DOMParser().parseFromString(getNewTableString(alertTarget), 'text/html');
            const newTableBody = html.getElementsByTagName('tbody')[0];
            const formattedRawData: string[] = [];

            newTableBody.childNodes.forEach((row) => {
              const id = (row as HTMLElement).getAttribute('d-symbol') || '';
              let formattedCell = '';

              row.childNodes.forEach((cell, idx, array) => {
                if (idx === array.length - 1) {
                  formattedCell += `${(cell as HTMLElement).innerText} \n ${id}`;
                } else {
                  formattedCell += `${(cell as HTMLElement).innerText} \n`;
                }
              });

              formattedRawData.push(formattedCell);
            });

            // Finally have the formatted data we need
            // puppeteerMutation(formattedRawData);
          }, 1000);
        },
        { owlAlert },
      );
    } catch (error) {
      console.log('DJG Bad Bug alert watch error: ');
      console.log(error);
    }
  })();
};

export { alertWatcher };

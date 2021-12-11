import puppeteer from 'puppeteer';
import 'dotenv/config';

import { modifier, splitData } from 'modifiers/modifier';
import { Environment, MessageType } from 'modifiers/enums';
import { sendMessage } from 'messageHandler';
import {
  mode,
  headless,
  url,
  username,
  password,
  alertError,
  htmlEmail,
  htmlPassword,
  htmlLoginBtn,
  htmlOptionsMenu,
  htmlOptionsAlert,
  htmlOptionsAlertBtn,
  timeout,
  launchArgs,
} from 'watcherConstants';
const alertWatcher = () => {
  // Get this working inside a container with args
  const puppeteerLaunchArgs = launchArgs;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const launcher = (async () => {
    try {
      const browser = await puppeteer.launch({
        args: puppeteerLaunchArgs,
        headless: headless,
      });
      const page = await browser.newPage();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const puppeteerMutation = (rawData: string[]) => '';
      // TODO: get initial persisted alerts
      const alerts: string[] = [];

      await page.goto(url);

      if (mode === Environment.PROD) {
        await page.type(htmlEmail, username);
        await page.type(htmlPassword, password);

        await Promise.all([page.waitForNavigation(), page.click(htmlLoginBtn)]);

        await page.click(htmlOptionsMenu);
        await page.waitForTimeout(timeout);
        await page.click(htmlOptionsAlertBtn);
      }

      await page.exposeFunction('puppeteerMutation', (rawData: string[]) => {
        const alertDataIdIndex = 10;

        rawData.forEach((alert) => {
          const data = splitData(alert);

          // Make sure we are not already keeping track of the id
          if (!alerts.includes(data[alertDataIdIndex])) {
            alerts.push(data[alertDataIdIndex]);
            void sendMessage(modifier(MessageType.ALERT, data));
          }
        });
      });

      await page.evaluate(
        ({ htmlOptionsAlert }) => {
          const alertTarget = document.querySelector(htmlOptionsAlert) as HTMLElement;

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

            const tableString = (newTableString += tableEnd);

            // Create a new table to append a new line so we can easily identify and split the data
            const html = new DOMParser().parseFromString(tableString, 'text/html');
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
            puppeteerMutation(formattedRawData);
          }, 1000);
        },
        { htmlOptionsAlert },
      );
    } catch (error) {
      console.log(alertError);
      console.log(error);
    }
  })();
};

export { alertWatcher };

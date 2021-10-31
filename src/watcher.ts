import puppeteer from 'puppeteer';
import 'dotenv/config';

import { modifier } from 'modifiers/modifier';
import { sendMessage } from 'messageHandler';

const production = 'PROD';
const mode = process.env.MODE || '';
const url = process.env.BAD_BUG || '';
const username = process.env.BAD_BUG_USERNAME || '';
const password = process.env.BAD_BUG_PASSWORD || '';

const owlFlow = process.env.OWL_FLOW || '';
const owlAlert = process.env.OWL_ALERT || '';
const owlFilter = process.env.OWL_FILTER || '';
const owlFilterAA = process.env.OWL_FILTER_AA || '';
const owlFilterAAA = process.env.OWL_FILTER_AAA || '';
const owlFilters = process.env.OWL_FILTERS || '';
const timeout = 3000;

const watcher = () => {
  // Get this working inside a container with args
  const puppeteerLaunchArgs = ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const flowWatcher = (async () => {
    try {
      const browser = await puppeteer.launch({
        args: puppeteerLaunchArgs,
      });
      const page = await browser.newPage();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const puppeteerMutation = (rawData: string) => '';

      await page.goto(url);

      if (mode === production) {
        await page.type('#Email', username);
        await page.type('#Password', password);

        await Promise.all([page.waitForNavigation(), page.click('#loginform > div:nth-child(6) > div > button')]);

        await page.click('#menuItemOptions');
        await page.click(owlFilter);
        await page.waitForTimeout(timeout);
        await page.click(owlFilterAA);
        await page.click(owlFilterAAA);
        await page.click(owlFilters);
      }

      await page.exposeFunction('puppeteerMutation', (rawData: string) => {
        void sendMessage(modifier(rawData));
      });

      await page.evaluate(
        ({ owlFlow }) => {
          const flowTarget = document.querySelector(owlFlow) as Node;

          const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.addedNodes.length) {
                puppeteerMutation((mutation.addedNodes[0] as HTMLElement).innerText);
              }
            }
          });

          observer.observe(flowTarget, {
            childList: true,
          });
        },
        { owlFlow },
      );
    } catch (error) {
      console.log('DJG Bad Bug flow watch error: ');
      console.log(error);
    }
  })();
};

export { watcher };

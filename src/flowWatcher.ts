import puppeteer from 'puppeteer';
import 'dotenv/config';

import { modifier, splitData } from 'modifiers/modifier';
import { Environment, MessageType } from 'modifiers/enums';
import { sendMessage } from 'messageHandler';
import {
  mode,
  url,
  username,
  password,
  owlFlow,
  owlFilter,
  owlFilterAA,
  owlFilterAAA,
  owlFilters,
  timeout,
  launchArgs,
} from 'watcherConstants';

const flowWatcher = () => {
  // Get this working inside a container with args
  const puppeteerLaunchArgs = launchArgs;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const launcher = (async () => {
    try {
      const browser = await puppeteer.launch({
        args: puppeteerLaunchArgs,
      });
      const page = await browser.newPage();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const puppeteerMutation = (rawData: string) => '';

      await page.goto(url);

      if (mode === Environment.PROD) {
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
        void sendMessage(modifier(MessageType.FLOW, splitData(rawData)));
      });

      await page.evaluate(
        ({ owlFlow }) => {
          const flowTarget = document.querySelector(owlFlow) as HTMLElement;

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

export { flowWatcher };

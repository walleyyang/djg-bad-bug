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
  flowError,
  htmlEmail,
  htmlPassword,
  htmlLoginBtn,
  htmlOptionsMenu,
  htmlOptionsFlowBody,
  htmlOptionsFilter,
  htmlOptionsFilterAA,
  htmlOptionsFilterAAA,
  htmlOptionsFilterSubmitBtn,
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
        headless: headless,
      });
      const page = await browser.newPage();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const puppeteerMutation = (rawData: string) => '';

      await page.goto(url);

      if (mode === Environment.PROD) {
        await page.type(htmlEmail, username);
        await page.type(htmlPassword, password);

        await Promise.all([page.waitForNavigation(), page.click(htmlLoginBtn)]);

        await page.click(htmlOptionsMenu);
        await page.click(htmlOptionsFilter);
        await page.waitForTimeout(timeout);
        await page.click(htmlOptionsFilterAA);
        await page.click(htmlOptionsFilterAAA);
        const filtersBtn = await page.$x(htmlOptionsFilterSubmitBtn);
        await filtersBtn[0].click();
      }

      await page.exposeFunction('puppeteerMutation', (rawData: string) => {
        void sendMessage(modifier(MessageType.FLOW, splitData(rawData)));
      });

      await page.evaluate(
        ({ htmlOptionsFlowBody }) => {
          const flowTarget = document.querySelector(htmlOptionsFlowBody) as HTMLElement;

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
        { htmlOptionsFlowBody },
      );
    } catch (error) {
      console.log(flowError);
      console.log(error);
    }
  })();
};

export { flowWatcher };

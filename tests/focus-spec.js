import { HtmlServer, syncify } from 'jasmine_test_utils';
import fs from 'fs';
import path from 'path';
import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import {By, until} from 'selenium-webdriver';

const createDriver = async function() {
  var tmpdir = fs.mkdtempSync('/tmp/focus_checker');
  //var chromeOpts = new chrome.Options();
  //chromeOpts.addArguments('--user-data-dir=' + tmpdir);
  //var profile = new firefox.Profile();
  var firefoxOpts = new firefox.Options();
  firefoxOpts.setProfile(tmpdir);
  return new Builder()
      .forBrowser('firefox')
      //.setChromeOptions(chromeOpts)
      .setFirefoxOptions(firefoxOpts)
      .build();
};
  const test = async (page, htmlServer) => {
      const frameSelector = '#moment-chat-frame';
      const inputSelector = '[data-test="enduser-chat-msg-box"]';
      const url1 = htmlServer.getUrl('/html/main.html');
      let wasFocused;
      let wasClicked;
      await page.get(url1);

      // switch to frame
      await page.wait(until.elementLocated(By.css(frameSelector)), 10000);
      const frame = await page.findElement(By.css(frameSelector));
      await page.switchTo().frame(frame);

      // wait for input and add listener
      await page.wait(until.elementLocated(By.css(inputSelector)), 10000);
      await page.executeScript((_selector) => {
        document.addEventListener('focusin', () => {
          window.wasFocused = true;
        }, true);
        document.addEventListener('click', () => {
          window.wasClicked = true;
        }, true);
      }, inputSelector);

      // click input
      let count = 0;
      while (!wasFocused && count < 5) {
        if (count > 0) {
          console.log('Focus failed. Retrying.')
          await page.executeScript(() => {
            window.wasFocused = false;
            window.wasClicked = false;
          });
        }
        await page.findElement(By.css(inputSelector)).click();
        await new Promise(r => setTimeout(r, 1000));
        wasFocused = await page.executeScript(() => {
          return window.wasFocused;
        });
        wasClicked = await page.executeScript(() => {
          return window.wasClicked;
        });
        count++;
      }
      if (!wasClicked) {console.log('Failed to click')}
      if (!wasFocused) {console.log('Failed to focus')}
      expect(wasClicked).toBe(true);
      expect(wasFocused).toBe(true);
  }

describe('focus_checker', function() {
  var htmlServer = null;
  var page = null;
  beforeAll(syncify(async function() {
    htmlServer = new HtmlServer({
      host: 'localhost',
      port: '7555',
      dir: path.resolve(__dirname),
    });
    htmlServer.start();
  }));
  describe('selenium', function() {
    var page = null;

    beforeEach(syncify(async function() {
      page = await createDriver();
    }));

    afterEach(syncify(async function() {
      await page.quit();
    }));
    for (let i = 0; i < 10000; i++) {
      it('should focus', syncify(async function() {
        await test(page, htmlServer);
      }), 60000);
    }
  });
});

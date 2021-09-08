/* eslint-disable */

// FIXME: putting these declarations in detox.d.ts makes them available in all
// test modules clashing with Jest's expect
declare const device: Detox.Device;
declare const element: Detox.Element;
declare const waitFor: Detox.WaitFor;
declare const expect: Detox.Expect<Detox.Expect<any>>;
declare const by: Detox.Matchers;

import * as detox from "detox";
import adapter from "detox/runners/jest/adapter";

const config = require("../../package.json").detox;

// Set the default test timeout (in milliseconds)
jest.setTimeout(5 * 60 * 1000);
(jasmine as any).getEnv().addReporter(adapter);

// 10 seconds seems a lot in development, but lower values are causing false positives
// on the CI environment. Don't touch it if you don't know what you are doing.
const WAIT_TIMEOUT_MS = 10 * 1000;

describe("e2e app", () => {
  const loginButtonId = "landing-button-login-spid";
  const posteIdpButtonId = "idp-posteid-button";

  beforeAll(async () => {
    await detox.init(config, { launchApp: false });
    await device.launchApp({ permissions: { notifications: "YES" } });
  });

  beforeEach(async () => {
    await adapter.beforeEach();
  });

  afterAll(async () => {
    await adapter.afterAll();
    await detox.cleanup();
  });

  describe("when the user never logged in before", () => {
    it("should let the user log in", async () => {
      await waitFor(element(by.id(loginButtonId)))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.id(loginButtonId)).tap();

      await waitFor(element(by.id(posteIdpButtonId)))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.id(posteIdpButtonId)).tap();

      // the webview returned by the server has 250ms timeout and reloads automagically

      await waitFor(element(by.text("Your usage data")))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);
    });
  });
});

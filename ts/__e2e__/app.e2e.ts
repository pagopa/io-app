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
// import { Millisecond } from "italia-ts-commons/lib/units";
// import { delayAsync } from "../utils/timer";

const config = require("../../package.json").detox;

// Set the default test timeout (in milliseconds)
jest.setTimeout(5 * 60 * 1000);
(jasmine as any).getEnv().addReporter(adapter);

const WAIT_TIMEOUT_MS = 5 * 1000;

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

    /* TODO: continue
    it("should let the user share the personal data", async () => {
      await element(by.text("Share data")).tap();
      await waitFor(element(by.text("Choose an unlock code")))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);
    });
    */
  });
});

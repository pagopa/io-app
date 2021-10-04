/* eslint-disable */

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

  describe("when the user is already logged in", () => {
    beforeAll(async () => {
      await waitFor(element(by.id(loginButtonId)))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.id(loginButtonId)).tap();

      await waitFor(element(by.id(posteIdpButtonId)))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.id(posteIdpButtonId)).tap();

      await waitFor(element(by.text("Your usage data")))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.text("Share data")).tap();

      await waitFor(element(by.text("Choose an unlock code")))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();

      await waitFor(element(by.text("Insert your code again")))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();

      await element(by.text("Continue")).tap();
    });

    it("should load the user's messages", async () => {
      await waitFor(element(by.text("Messages")))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      // The webserver is sending us exactly 20 messages with consecutive IDs
      // in reverse order.
      // We test that the first one is visibile on the UI and that the last one
      // exists (but is not visible)

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000020`))
      )
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000001`))
      )
        .toExist()
        .withTimeout(WAIT_TIMEOUT_MS);
    });
  });
});

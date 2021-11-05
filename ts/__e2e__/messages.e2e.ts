// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as detox from "detox";
import adapter from "detox/runners/jest/adapter";

import I18n from "../i18n";
import { E2E_WAIT_RENDER_TIMEOUT_MS } from "./config";
import { ensureLoggedIn } from "./utils";

describe("Messages Screen", () => {
  beforeEach(async () => {
    await adapter.beforeEach();
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  describe("when the user is already logged in", () => {
    it("should load the user's messages", async () => {
      await waitFor(element(by.text(I18n.t("messages.contentTitle"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      // The webserver is sending us exactly 20 messages with consecutive IDs
      // in reverse order.
      // We test that the first one is visible on the UI and that the last one
      // exists (but is not visible)

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000020`))
      )
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000001`))
      )
        .toExist()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);
    });
  });
});

import { device } from "detox";

import { e2eWaitRenderTimeout } from "./config";
import { ensureLoggedIn } from "./utils";

describe("Messages Screen", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  describe("when the user is already logged in", () => {
    it("should load the user's messages", async () => {
      await waitFor(element(by.id("MessageList_inbox")))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      // The webserver is sending us exactly 20 messages with consecutive IDs
      // in reverse order.
      // We test that the first one is visible on the UI and that the last one
      // exists (but is not visible)

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000020`))
      )
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      // check for infinite scrolling
      await element(by.id(`MessageList_inbox`)).scrollTo("bottom");

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000008`))
      )
        .toExist()
        .withTimeout(e2eWaitRenderTimeout);
    });
  });
});

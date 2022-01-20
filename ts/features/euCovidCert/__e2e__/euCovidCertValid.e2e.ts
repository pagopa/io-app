import { device } from "detox";

import I18n from "../../../i18n";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";

describe("EuCovidCert Valid", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  describe("when the user is already logged in", () => {
    it("should load the user's messages", async () => {
      await waitFor(element(by.text(I18n.t("messages.contentTitle"))))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000021`))
      )
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000001`))
      )
        .toExist()
        .withTimeout(e2eWaitRenderTimeout);
    });
  });
});

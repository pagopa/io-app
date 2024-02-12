import { device } from "detox";
import I18n from "../../../i18n";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";
import { openValidEUCovidMessage } from "./utils";

describe("EuCovidCert Valid", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should open the certificate details page and return back", async () => {
    await openValidEUCovidMessage();

    await waitFor(element(by.text(I18n.t("global.buttons.details"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    const detailsButton = element(by.text(I18n.t("global.buttons.details")));
    await detailsButton.tap();

    await waitFor(element(by.text(I18n.t("global.buttons.close"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    const closeButton = element(by.text(I18n.t("global.buttons.close")));
    await closeButton.tap();
  });
});

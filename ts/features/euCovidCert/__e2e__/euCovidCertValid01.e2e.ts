import { device } from "detox";
import I18n from "../../../i18n";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";
import {
  fullScreenQrCodeTestId,
  openValidEUCovidMessage,
  qrCodeTestId
} from "./utils";

describe("EuCovidCert Valid", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should open the QRCode in fullscreen and return back", async () => {
    await openValidEUCovidMessage();

    const qrCode = element(by.id(qrCodeTestId));
    await qrCode.tap();

    await waitFor(element(by.id(fullScreenQrCodeTestId)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(I18n.t("global.buttons.close"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    const closeButton = element(by.text(I18n.t("global.buttons.close")));
    await closeButton.tap();
  });
});

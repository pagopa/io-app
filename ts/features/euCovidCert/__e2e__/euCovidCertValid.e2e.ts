import { device } from "detox";
import I18n from "../../../i18n";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertValidSubject = "🏥 EUCovidCert - valid";
const euCovidCertValidTitle = "Valid Certificate title";
const euCovidCertValidSubTitle = "Valid Certificate sub title";

const messageListTestId = "messageList";
const qrCodeTestId = "QRCode";
const fullScreenQrCodeTestId = "FullScreenQRCode";

describe("EuCovidCert Valid", () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  it("should load all the messages", async () => {
    await waitFor(element(by.text(I18n.t("messages.contentTitle"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.id(`MessageListItem_00000000000000000000000021`)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });

  it("should find the valid EuCovidCert and open it", async () => {
    await waitFor(element(by.text(euCovidCertValidSubject)))
      .toBeVisible()
      .whileElement(by.id(messageListTestId))
      .scroll(350, "down");

    const subject = element(by.text(euCovidCertValidSubject));
    await subject.tap();
  });

  it("should check all the correct elements in the details page", async () => {
    await waitFor(element(by.text(euCovidCertValidTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(euCovidCertValidSubTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(I18n.t("global.genericSave"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.id(qrCodeTestId)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });

  it("should open the QRCode in fullscreen and return back to the details page", async () => {
    const qrCode = element(by.id(qrCodeTestId));
    await qrCode.tap();

    await waitFor(element(by.id(fullScreenQrCodeTestId)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(I18n.t("global.buttons.close"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    // Return to the previous screen.
    const closeButton = element(by.text(I18n.t("global.buttons.close")));
    await closeButton.tap();
  });

  it("should save the QRCode in the gallery", async () => {
    await waitFor(element(by.text(I18n.t("global.genericSave"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    const saveButton = element(by.text(I18n.t("global.genericSave")));
    await saveButton.tap();
  });
});

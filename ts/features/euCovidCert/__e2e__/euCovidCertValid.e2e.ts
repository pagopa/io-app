import { device } from "detox";

import I18n from "../../../i18n";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertValidSubject = "🏥 EUCovidCert - valid";
const euCovidCertCTA = "EuCovidCertCTA";
const messagesListId = "messagesList";

describe("EuCovidCert Valid", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  it("open a valid EuCovidCert", async () => {
    await waitFor(element(by.text(I18n.t("messages.contentTitle"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.id(`MessageListItem_00000000000000000000000021`)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(euCovidCertValidSubject)))
      .toBeVisible()
      .whileElement(by.id(messagesListId))
      .scroll(250, "down");

    const cta = element(by.id(euCovidCertCTA)).atIndex(0);

    await cta.tap();
  });
});

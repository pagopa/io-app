import { device } from "detox";
import I18n from "../../../i18n";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertValidSubject = "🏥 EUCovidCert - valid";
const euCovidCertValidTitle = "Valid Certificate title";

const messageListTestId = "messageList";

describe("EuCovidCert Valid", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  it("should open a valid EuCovidCert", async () => {
    await waitFor(element(by.text(I18n.t("messages.contentTitle"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.id(`MessageListItem_00000000000000000000000021`)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(euCovidCertValidSubject)))
      .toBeVisible()
      .whileElement(by.id(messageListTestId))
      .scroll(350, "down");

    const subject = element(by.text(euCovidCertValidSubject));

    await subject.tap();

    await waitFor(element(by.text(euCovidCertValidTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });
});

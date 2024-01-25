import { device } from "detox";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertExpiredSubject = "🏥 EUCovidCert - expired";
const euCovidCertExpiredTitle = "Expired Certificate title";
const euCovidCertExpiredSubTitle = "Expired Certificate sub title";

const messageListTestId = "MessageList_inbox";
const learnMoreLinkTestId = "euCovidCertLearnMoreLink";

describe("EuCovidCert Expired", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should find the expired EuCovidCert message and open it", async () => {
    await waitFor(element(by.text(euCovidCertExpiredSubject)))
      .toBeVisible()
      .whileElement(by.id(messageListTestId))
      .scroll(350, "down");

    const subject = element(by.text(euCovidCertExpiredSubject));
    await subject.tap();
  });

  it("should check all the correct elements in the details page", async () => {
    await waitFor(element(by.text(euCovidCertExpiredTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(euCovidCertExpiredSubTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.id(learnMoreLinkTestId)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });
});

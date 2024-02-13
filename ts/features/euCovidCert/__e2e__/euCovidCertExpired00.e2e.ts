import { device } from "detox";
import { ensureLoggedIn } from "../../../__e2e__/utils";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { learnMoreLinkTestId, scrollToEUCovidMessage } from "./utils";

const euCovidCertExpiredSubject = "🏥 EUCovidCert - expired";
const euCovidCertExpiredTitle = "Expired Certificate title";
const euCovidCertExpiredSubTitle = "Expired Certificate sub title";

describe("EuCovidCert Expired", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should find the expired EuCovidCert message, open it and check all the correct elements in the details page", async () => {
    await openExpiredEUCovidMessage();

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

const openExpiredEUCovidMessage = async () => {
  await scrollToEUCovidMessage(euCovidCertExpiredSubject);

  const subject = element(by.text(euCovidCertExpiredSubject));
  await subject.tap();
};

import { device } from "detox";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertExpiredTitle = "Expired Certificate title";
const euCovidCertExpiredSubTitle = "Expired Certificate sub title";

const learnMoreLinkTestId = "euCovidCertLearnMoreLink";

describe("EuCovidCert Expired", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
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

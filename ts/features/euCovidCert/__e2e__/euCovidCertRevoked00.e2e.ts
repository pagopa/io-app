import { device } from "detox";
import { ensureLoggedIn } from "../../../__e2e__/utils";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { learnMoreLinkTestId, scrollToEUCovidMessage } from "./utils";

const euCovidCertRevokedSubject = "🏥 EUCovidCert - revoked";
const euCovidCertRevokedTitle = "Revoked Certificate title";
const euCovidCertRevokedSubTitle = "Revoked Certificate sub title";

describe("EuCovidCert Revoked", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should find the revoked EuCovidCert message, open it and check all the correct elements in the details page", async () => {
    await openRevokedEUCovidMessage();

    await waitFor(element(by.text(euCovidCertRevokedTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(euCovidCertRevokedSubTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.id(learnMoreLinkTestId)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });
});

const openRevokedEUCovidMessage = async () => {
  await scrollToEUCovidMessage(euCovidCertRevokedSubject);

  const subject = element(by.text(euCovidCertRevokedSubject));
  await subject.tap();
};

import { device } from "detox";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertRevokedSubject = "🏥 EUCovidCert - revoked";
const euCovidCertRevokedTitle = "Revoked Certificate title";
const euCovidCertRevokedSubTitle = "Revoked Certificate sub title";

const messageListTestId = "MessageList_inbox";
const learnMoreLinkTestId = "euCovidCertLearnMoreLink";

describe("EuCovidCert Revoked", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should find the revoked EuCovidCert message and open it", async () => {
    await waitFor(element(by.text(euCovidCertRevokedSubject)))
      .toBeVisible()
      .whileElement(by.id(messageListTestId))
      .scroll(350, "down");

    const subject = element(by.text(euCovidCertRevokedSubject));
    await subject.tap();
  });

  it("should check all the correct elements in the details page", async () => {
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

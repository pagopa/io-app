import { device } from "detox";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertRevokedSubject = "🏥 EUCovidCert - revoked";

const messageListTestId = "MessageList_inbox";

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
});

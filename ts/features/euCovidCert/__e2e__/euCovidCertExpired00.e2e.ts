import { device } from "detox";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertExpiredSubject = "🏥 EUCovidCert - expired";

const messageListTestId = "MessageList_inbox";

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
});

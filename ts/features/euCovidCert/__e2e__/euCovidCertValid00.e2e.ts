import { device } from "detox";
import { ensureLoggedIn } from "../../../__e2e__/utils";

const euCovidCertValidSubject = "🏥 EUCovidCert - valid";

const messageListTestId = "MessageList_inbox";

describe("EuCovidCert Valid", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should find the valid EuCovidCert message and open it", async () => {
    await waitFor(element(by.text(euCovidCertValidSubject)))
      .toBeVisible()
      .whileElement(by.id(messageListTestId))
      .scroll(350, "down");

    const subject = element(by.text(euCovidCertValidSubject));
    await subject.tap();
  });
});

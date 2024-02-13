import { device } from "detox";
import I18n from "../../../i18n";
import { ensureLoggedIn } from "../../../__e2e__/utils";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { openValidEUCovidMessage, qrCodeTestId } from "./utils";

const euCovidCertValidTitle = "Valid Certificate title";
const euCovidCertValidSubTitle = "Valid Certificate sub title";

describe("EuCovidCert Valid", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should find the valid EuCovidCert message, open it and check all the correct elements in the details page", async () => {
    await openValidEUCovidMessage();

    await waitFor(element(by.text(euCovidCertValidTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(euCovidCertValidSubTitle)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.text(I18n.t("global.genericSave"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.id(qrCodeTestId)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });
});

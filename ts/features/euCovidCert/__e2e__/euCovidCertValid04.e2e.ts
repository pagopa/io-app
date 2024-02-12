import { device } from "detox";
import I18n from "../../../i18n";
import { e2eWaitRenderTimeout } from "../../../__e2e__/config";
import { ensureLoggedIn } from "../../../__e2e__/utils";

describe("EuCovidCert Valid", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("should save the certificate in the gallery", async () => {
    await waitFor(element(by.text(I18n.t("global.genericSave"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    const saveButton = element(by.text(I18n.t("global.genericSave")));
    await saveButton.tap();

    await waitFor(
      element(
        by.text(
          I18n.t(
            "features.euCovidCertificate.save.bottomSheet.saveAsImage.title"
          )
        )
      )
    )
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    const saveIntoGalleryButton = element(
      by.text(
        I18n.t("features.euCovidCertificate.save.bottomSheet.saveAsImage.title")
      )
    );
    await saveIntoGalleryButton.tap();

    await waitFor(
      element(by.text(I18n.t("features.euCovidCertificate.save.ok")))
    )
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });
});

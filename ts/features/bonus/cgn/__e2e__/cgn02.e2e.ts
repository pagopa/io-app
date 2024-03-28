import { e2eWaitRenderTimeout } from "../../../../__e2e__/config";
import { ensureLoggedIn } from "../../../../__e2e__/utils";
import I18n from "../../../../i18n";
import { activateCGNBonusSuccess, deactivateCGNCardIfNeeded } from "./utils";

const CGN_TITLE = "Carta Giovani Nazionale";
const SERVICES_LIST = "services-list";

jest.mock("../../config", () => ({ isNewServicesEnabled: false }));

describe("CGN", () => {
  beforeEach(async () => {
    await deactivateCGNCardIfNeeded();
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("When the user want to start activation from service detail, it should complete activation", async () => {
    await element(by.text(I18n.t("global.navigator.services"))).tap();

    await waitFor(element(by.id(SERVICES_LIST)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    await waitFor(element(by.id(CGN_TITLE)))
      .toBeVisible()
      .whileElement(by.id(SERVICES_LIST))
      .scroll(300, "down");

    await element(by.id(CGN_TITLE)).tap();
    const startActivationCta = element(by.id("service-activate-bonus-button"));
    await waitFor(startActivationCta)
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
    await startActivationCta.tap();
    await activateCGNBonusSuccess();
  });
});

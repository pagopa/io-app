import { e2eWaitRenderTimeout } from "../../../../__e2e__/config";
import { ensureLoggedIn } from "../../../../__e2e__/utils";
import I18n from "../../../../i18n";
import { activateCGNBonusSuccess, deactivateCGNCardIfNeeded } from "./utils";

describe("CGN", () => {
  beforeEach(async () => {
    await deactivateCGNCardIfNeeded();
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("When the user want to start activation from card carousel, it should complete activation", async () => {
    await element(by.text(I18n.t("global.navigator.wallet"))).tap();
    // TODO: This could be fail if we will add more e2e tests on the addition of a new payment method (just do a single swipe, not a scroll)
    await waitFor(element(by.id("walletPaymentMethodsTestId")))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
    await element(by.id("walletPaymentMethodsTestId")).swipe("up");
    await element(by.id("FeaturedCardCGNTestID")).tap();
    await activateCGNBonusSuccess();
  });
});

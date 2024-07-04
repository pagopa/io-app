import { e2eWaitRenderTimeout } from "../../../../__e2e__/config";
import { ensureLoggedIn } from "../../../../__e2e__/utils";
import I18n from "../../../../i18n";
import { ID_CGN_TYPE } from "../../common/utils";
import { activateCGNBonusSuccess, deactivateCGNCardIfNeeded } from "./utils";

describe("CGN", () => {
  beforeEach(async () => {
    await deactivateCGNCardIfNeeded();
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("When the user want to start activation from bonus list, it should complete activation", async () => {
    await element(by.text(I18n.t("global.navigator.wallet"))).tap();
    const plusButton = element(by.id("walletAddNewPaymentMethodTestId"));
    await waitFor(plusButton).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await plusButton.tap();
    const cgnButton = element(by.id("bonusNameTestId"));
    await waitFor(cgnButton).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await cgnButton.tap();
    const cgnBonusItem = element(by.id(`AvailableBonusItem-${ID_CGN_TYPE}`));
    await waitFor(cgnBonusItem).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await cgnBonusItem.tap();
    await activateCGNBonusSuccess();
  });
});

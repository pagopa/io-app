import { e2eWaitRenderTimeout } from "../../../../__e2e__/config";
import { ensureLoggedIn } from "../../../../__e2e__/utils";
import I18n from "../../../../i18n";

const CGN_TITLE = "Carta Giovani Nazionale";
const CGN_BONUS_ITEM =
  "Carta Giovani Nazionale (CGN) è l’incentivo per i giovani che favorisce la partecipazione ad attività culturali, sportive e ricreative, su tutto il territorio nazionale";
const SERVICES_LIST = "services-list";

const activateBonusSuccess = async () => {
  const startActivationCta = element(by.id("activate-bonus-button"));
  await waitFor(startActivationCta)
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await startActivationCta.tap();
  await waitFor(element(by.text(I18n.t("bonus.cgn.activation.success.title"))))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  // We should unsubscribe after the activation, in order to allow the next test run (we can remove this part when we will have the possibility
  // to reset the dev-server with an API command.

  // Go to bonus details
  await element(by.text(I18n.t("bonus.cgn.cta.goToDetail"))).tap();

  // wait for unsubscribe cta
  const unsubscribeCgnCta = element(
    by.text(I18n.t("bonus.cgn.cta.deactivateBonus"))
  );
  await waitFor(unsubscribeCgnCta)
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  // unsubscribe
  await unsubscribeCgnCta.tap();

  // confirm alert
  const alertCTA = element(by.text(I18n.t("global.buttons.deactivate")));
  await waitFor(alertCTA).toBeVisible().withTimeout(e2eWaitRenderTimeout);
  await alertCTA.tap();
};

describe("CGN", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  describe("When the user want to start activation from bonus list", () => {
    it("Should complete activation", async () => {
      await element(by.text(I18n.t("global.navigator.wallet"))).tap();
      await element(
        by.text(I18n.t("wallet.newPaymentMethod.add").toUpperCase())
      ).tap();
      await element(by.text(I18n.t("wallet.methods.bonus.name"))).tap();
      const cgnBonusItem = element(by.text(CGN_BONUS_ITEM));
      await waitFor(cgnBonusItem)
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
      await cgnBonusItem.tap();
      await activateBonusSuccess();
    });
  });

  describe("When the user want to start activation from card carousel", () => {
    it("Should complete activation", async () => {
      await element(by.text(I18n.t("global.navigator.wallet"))).tap();
      // TODO: This could be fail if we will add more e2e tests on the addition of a new payment method (just do a single swipe, not a scroll)
      await waitFor(element(by.text(I18n.t("wallet.paymentMethods"))))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
      await element(by.text(I18n.t("wallet.paymentMethods"))).swipe("up");
      await element(by.id("FeaturedCardCGNTestID")).tap();
      await activateBonusSuccess();
    });
  });

  describe("When the user want to start activation from service detail", () => {
    it("Should complete activation", async () => {
      await element(by.text(I18n.t("global.navigator.services"))).tap();

      await waitFor(element(by.id(SERVICES_LIST)))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      await waitFor(element(by.id(CGN_TITLE)))
        .toBeVisible()
        .whileElement(by.id(SERVICES_LIST))
        .scroll(300, "down");

      await element(by.id(CGN_TITLE)).tap();
      const startActivationCta = element(
        by.text(I18n.t("bonus.cgn.cta.activeBonus"))
      );
      await waitFor(startActivationCta)
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
      await startActivationCta.tap();
      await activateBonusSuccess();
    });
  });
});

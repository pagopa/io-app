import { ensureLoggedIn } from "../../../../__e2e__/utils";
import I18n from "../../../../i18n";
import { e2eWaitRenderTimeout } from "../../../../__e2e__/config";

const CGN_TITLE = "Carta Giovani Nazionale";
const CGN_BONUS_ITEM =
  "Carta Giovani Nazionale (CGN) è l’incentivo per i giovani che favorisce la partecipazione ad attività culturali, sportive e ricreative, su tutto il territorio nazionale";

const activateBonusSuccess = async () => {
  const startActivationCta = element(by.id("activate-bonus-button"));
  await waitFor(startActivationCta)
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await startActivationCta.tap();
  await waitFor(element(by.text(I18n.t("bonus.cgn.activation.success.title"))))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
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
      await element(by.id("FeaturedCardCGNTestID")).tap();
      await activateBonusSuccess();
    });
  });

  describe("When the user want to start activation from service detail", () => {
    it("Should complete activation", async () => {
      await element(by.text(I18n.t("global.navigator.services"))).tap();
      const cgnServiceItem = element(by.id(CGN_TITLE));
      await waitFor(cgnServiceItem)
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
      await cgnServiceItem.tap();
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

  afterEach(async () => {
    await device.reloadReactNative();
    await ensureLoggedIn();
    await element(by.text(I18n.t("global.navigator.wallet"))).tap();
    const cgnCardItem = element(by.id("cgn-card-component"));
    await waitFor(cgnCardItem).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await cgnCardItem.tap();
    const unsubscribeCgnCta = element(
      by.text(I18n.t("bonus.cgn.cta.deactivateBonus"))
    );
    await waitFor(unsubscribeCgnCta)
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
    await unsubscribeCgnCta.tap();
    const alertCTA = element(by.text(I18n.t("global.buttons.deactivate")));
    await waitFor(alertCTA).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await alertCTA.tap();
  });
});

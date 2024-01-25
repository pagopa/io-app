import fetch from "node-fetch";
import { e2eWaitRenderTimeout } from "../../../../__e2e__/config";
import { ensureLoggedIn } from "../../../../__e2e__/utils";
import I18n from "../../../../i18n";
import { ID_CGN_TYPE } from "../../common/utils";

const CGN_TITLE = "Carta Giovani Nazionale";
const SERVICES_LIST = "services-list";

const activateBonusSuccess = async () => {
  const startActivationCta = element(by.id("activate-bonus-button"));
  await waitFor(startActivationCta)
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await startActivationCta.tap();
  await waitFor(element(by.id("cgnConfirmButtonTestId")))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  // We should unsubscribe after the activation, in order to allow the next test run (we can remove this part when we will have the possibility
  // to reset the dev-server with an API command.

  // Go to bonus details
  await element(by.id("cgnConfirmButtonTestId")).tap();

  // wait for unsubscribe cta
  const scrollView = element(by.id("CGNCardDetailsScrollView"));

  // The section has a loading spinner on top of
  // everything so we must wait for it to disappear
  await waitFor(scrollView).toBeVisible().withTimeout(e2eWaitRenderTimeout);

  // make sure to scroll to bottom, otherwise in small devices the element will not be visible nor tappable
  await scrollView.scrollTo("bottom");

  const unsubscribeCgnCta = element(by.id("cgnDeactivateBonusTestId"));
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
    await deactivateCGNCardIfNeeded();
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  describe("When the user want to start activation from bonus list", () => {
    it("Should complete activation", async () => {
      await element(by.text(I18n.t("global.navigator.wallet"))).tap();
      await element(by.id("walletAddNewPaymentMethodTestId")).tap();
      await element(by.id("bonusNameTestId")).tap();
      const cgnBonusItem = element(by.id(`AvailableBonusItem-${ID_CGN_TYPE}`));
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
      await waitFor(element(by.id("walletPaymentMethodsTestId")))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
      await element(by.id("walletPaymentMethodsTestId")).swipe("up");
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
        by.id("service-activate-bonus-button")
      );
      await waitFor(startActivationCta)
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
      await startActivationCta.tap();
      await activateBonusSuccess();
    });
  });
});

const deactivateCGNCardIfNeeded = async () => {
  // This is needed since an E2E can fail at any moment. If it does so
  // after the card has been activated, all subsequent retries and tests
  // will fail, since the card is already activated. Be aware that this
  // endpoint is not authenticated (or, better said, when the authorization
  // header is not set, the fastLoginMiddleware, in the dev-server, skips
  // any authentication check)
  const cgnDeactivationEndpoint = "http://127.0.0.1:3000/api/v1/cgn/delete";
  // eslint-disable-next-line functional/no-let
  let responseCode = -1;
  try {
    const response = await fetch(cgnDeactivationEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    responseCode = response.status;
  } catch (error) {
    // We are not really interested about the error
    // eslint-disable-next-line no-console
    console.log(`deactivateCGNCardIfNeeded: ${error}`);
  }

  if (responseCode !== 201 && responseCode !== 403) {
    throw new Error(
      `Invalid response code from CGN deactivateion (${responseCode}), check the CGN deactivation endpoint (${cgnDeactivationEndpoint}) and the dev-server configuration for CGN deactivation`
    );
  }
};

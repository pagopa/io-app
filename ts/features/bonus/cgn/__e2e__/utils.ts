import fetch from "node-fetch";
import { e2eWaitRenderTimeout } from "../../../../__e2e__/config";
import I18n from "../../../../i18n";

export const activateCGNBonusSuccess = async () => {
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
  await waitFor(scrollView)
    .toBeVisible()
    .withTimeout(2 * e2eWaitRenderTimeout);

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

export const deactivateCGNCardIfNeeded = async () => {
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

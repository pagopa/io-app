import { CommonActions } from "@react-navigation/native";
import { select, call, take } from "typed-redux-saga/macro";
import { createStandardAction } from "typesafe-actions";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
import { isPremiumMessagesOptInOutEnabledSelector } from "../store/reducers/backendStatus";

/**
 * This selector is a mock for a future selector which
 * will retrieve the preference the user gave from the
 * backend.
 */
export const isPremiumMessagesAcceptedSelector = (): boolean | null => false;

/**
 * A mock action that will complete this saga.
 */
export const setPremiumMessagesAccepted = createStandardAction(
  "SET_PREMIUM_MESSAGES_ACCEPTED"
)<boolean>();

/**
 * Check, and eventually ask, about the premium messages otp-in.
 */
export function* askPremiumMessagesOptInOut() {
  const isOptInOutEnabled = yield* select(
    isPremiumMessagesOptInOutEnabledSelector
  );

  // If the opt-in/out screen is not enabled
  // through the remote feature flag then exit
  // this saga.
  if (!isOptInOutEnabled) {
    return;
  }

  const premiumMessagesAccepted = yield* select(
    isPremiumMessagesAcceptedSelector
  );

  // If the user already expressed a preference
  // nothing else is required.
  if (premiumMessagesAccepted !== null) {
    return;
  }

  // navigate to the screen where user can opt-in or not his preference
  // wait until he/she done a choice.
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.ONBOARDING, {
      route: ROUTES.ONBOARDING_PREMIUM_MESSAGES_OPT_IN_OUT
    })
  );

  // The action that will allow this saga to complete.
  yield* take(setPremiumMessagesAccepted);
}

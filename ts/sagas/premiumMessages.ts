import { select, call, take } from "typed-redux-saga/macro";
import { NavigationActions } from "react-navigation";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";

/**
 * This selector is a mock for a future selector which
 * will retrieve the preference the user gave from the
 * backend.
 */
const isPremiumMessagesEnabledSelector = (): boolean | null => false;

/**
 * check, and eventually ask, about the premium messages otp-in.
 */
export function* askPremiumMessagesOptIn() {
  const isEnabled = yield* select(isPremiumMessagesEnabledSelector);

  // If the user already expressed a preference
  // nothing else is required.
  if (isEnabled !== null) {
    return;
  }
  // navigate to the screen where user can opt-in or not his preference
  // wait until he/she done a choice.
  yield* call(
    NavigationService.dispatchNavigationAction,
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_PREMIUM_MESSAGES_OPT_IN_OUT
    })
  );

  // The action that will allow this saga to complete.
  yield* take(Symbol());
}

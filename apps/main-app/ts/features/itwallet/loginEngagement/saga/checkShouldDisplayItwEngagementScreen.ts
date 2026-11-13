import { StackActions } from "@react-navigation/native";
import { call, put, select } from "typed-redux-saga/macro";

import NavigationService from "../../../../navigation/NavigationService";
import { hashedProfileFiscalCodeSelector } from "../../../../store/reducers/crossSessions";
import { itwSetEngagementScreenShown } from "../../common/store/actions/preferences";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwShouldShowEngagementScreenSelector } from "../store/selectors";

/**
 * Shows the ITW login engagement screen if the current user is eligible.
 *
 * @returns `true` if the screen has been displayed, `false` otherwise
 */
export function* checkShouldDisplayItwEngagementScreen(
  isFirstOnboarding: boolean
) {
  if (isFirstOnboarding) {
    return false;
  }

  const user = yield* select(hashedProfileFiscalCodeSelector);
  const shouldShow = yield* select(itwShouldShowEngagementScreenSelector);

  if (!user || !shouldShow) {
    return false;
  }

  yield* put(itwSetEngagementScreenShown(user));
  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.push(ITW_ROUTES.MAIN, { screen: ITW_ROUTES.ENGAGEMENT })
  );
  return true;
}

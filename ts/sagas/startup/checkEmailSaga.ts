import { call, put, take } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import { StackActions } from "@react-navigation/native";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import {
  isProfileEmailValidated,
  isProfileEmailAlreadyTaken
} from "../../store/reducers/profile";
import { ReduxSagaEffect } from "../../types/utils";
import { isNewCduFlow } from "../../config";
import { setEmailCheckAtStartupFailure } from "../../store/actions/profile";
import { emailAcknowledged } from "../../store/actions/onboarding";

export function* checkEmailSaga(
  userProfile: InitializedProfile
): IterableIterator<ReduxSagaEffect> {
  if (isNewCduFlow && !isProfileEmailValidated(userProfile)) {
    yield* put(setEmailCheckAtStartupFailure(O.some(true)));
    if (isProfileEmailAlreadyTaken(userProfile)) {
      yield* call(NavigationService.navigate, ROUTES.CHECK_EMAIL, {
        screen: ROUTES.CHECK_EMAIL_ALREADY_TAKEN,
        params: { email: userProfile.email }
      });
    } else {
      yield* call(NavigationService.navigate, ROUTES.CHECK_EMAIL, {
        screen: ROUTES.CHECK_EMAIL_NOT_VERIFIED
      });
    }
    // Wait for the user to press "Continue" button after having checked out
    // his own email
    yield* take(emailAcknowledged);
    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.popToTop()
    );
  }
}

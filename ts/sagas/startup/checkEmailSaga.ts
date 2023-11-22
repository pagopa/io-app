import { call } from "typed-redux-saga/macro";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import {
  isProfileEmailValidated,
  isProfileEmailAlreadyTaken
} from "../../store/reducers/profile";
import { ReduxSagaEffect } from "../../types/utils";
import { isNewCduFlow } from "../../config";

export function* checkEmailSaga(
  userProfile: InitializedProfile
): IterableIterator<ReduxSagaEffect> {
  if (isNewCduFlow && !isProfileEmailValidated(userProfile)) {
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
  }
}

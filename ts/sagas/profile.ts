/**
 * A saga that manages the Profile.
 */
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { sha256 } from "react-native-sha256";
import { call, Effect, put, select, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { BackendClient } from "../api/backend";
import { setInstabugUserAttribute } from "../boot/configureInstabug";
import { tosVersion } from "../config";
import I18n from "../i18n";
import { sessionExpired } from "../store/actions/authentication";
import {
  profileLoadFailure,
  profileLoadRequest,
  profileLoadSuccess,
  profileUpsert,
  startEmailValidation
} from "../store/actions/profile";
import { profileSelector } from "../store/reducers/profile";
import { GlobalState } from "../store/reducers/types";
import { SagaCallReturnType } from "../types/utils";

// A saga to load the Profile.
export function* loadProfile(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Iterator<Effect | Option<InitializedProfile>> {
  try {
    const response: SagaCallReturnType<typeof getProfile> = yield call(
      getProfile,
      {}
    );
    // we got an error, throw it
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }
    if (response.value.status === 200) {
      // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
      // BEWARE: we need to cast to UserProfileUnion to make UserProfile a
      // discriminated union!
      // tslint:disable-next-line:no-useless-cast
      const initializedProfile = response.value.value as InitializedProfile;
      yield put(profileLoadSuccess(initializedProfile));
      // send the hash of fiscal code to Instabug
      sha256(initializedProfile.fiscal_code).then(hash =>
        setInstabugUserAttribute("fiscalcode", hash)
      );

      return some(response.value.value);
    }
    if (response.value.status === 401) {
      // in case we got an expired session while loading the profile, we reset
      // the session
      yield put(sessionExpired());
    }
    throw response
      ? Error(`response status ${response.value.status}`)
      : Error(I18n.t("profile.errors.load"));
  } catch (error) {
    yield put(profileLoadFailure(error));
  }
  return none;
}

// A saga to update the Profile.
function* createOrUpdateProfileSaga(
  createOrUpdateProfile: ReturnType<
    typeof BackendClient
  >["createOrUpdateProfile"],
  action: ActionType<typeof profileUpsert["request"]>
): Iterator<Effect> {
  // Get the current Profile from the state
  const profileState: ReturnType<typeof profileSelector> = yield select<
    GlobalState
  >(profileSelector);

  if (pot.isNone(profileState)) {
    // somewhing's wrong, we don't even have an AuthenticatedProfile meaning
    // the user didn't yet authenticated: ignore this upsert request.
    return;
  }

  const currentProfile = profileState.value;

  // If we already have a profile, merge it with the new updated attributes
  // or else, create a new profile from the provided object
  // FIXME: perhaps this is responsibility of the caller?
  const newProfile: ExtendedProfile = currentProfile.has_profile
    ? {
        is_inbox_enabled: currentProfile.is_inbox_enabled,
        is_webhook_enabled: currentProfile.is_webhook_enabled,
        is_email_validated: currentProfile.is_email_validated || false,
        is_email_enabled: currentProfile.is_email_enabled,
        version: currentProfile.version,
        email: currentProfile.email,
        preferred_languages: currentProfile.preferred_languages,
        blocked_inbox_or_channels: currentProfile.blocked_inbox_or_channels,
        accepted_tos_version: currentProfile.accepted_tos_version,
        ...action.payload
      }
    : {
        is_inbox_enabled: false,
        is_webhook_enabled: false,
        is_email_validated: action.payload.is_email_validated || false,
        is_email_enabled: action.payload.is_email_enabled || false,
        ...action.payload,
        accepted_tos_version: tosVersion,
        version: 0
      };
  try {
    const response: SagaCallReturnType<
      typeof createOrUpdateProfile
    > = yield call(createOrUpdateProfile, {
      profile: newProfile
    });

    if (response.isLeft()) {
      throw new Error(readableReport(response.value));
    }

    if (response.value.status === 409) {
      // It could happen that profile update fails due to version number mismatch
      // app has a different version of profile compared to that one owned by the backend
      // so we force profile reloading (see https://www.pivotaltracker.com/n/projects/2048617/stories/171994417)
      yield put(profileLoadRequest());
      throw new Error(response.value.value.title);
    }

    if (response.value.status === 401) {
      // on 401, expire the current session and restart the authentication flow
      yield put(sessionExpired());
      throw new Error(I18n.t("profile.errors.upsert"));
    }

    if (response.value.status !== 200) {
      // We got a error, send a SESSION_UPSERT_FAILURE action
      throw new Error(response.value.value.title);
    } else {
      // Ok we got a valid response, send a SESSION_UPSERT_SUCCESS action
      yield put(profileUpsert.success(response.value.value));
    }
  } catch (e) {
    const error: Error = e || Error(I18n.t("profile.errors.upsert"));
    yield put(profileUpsert.failure(error));
  }
}

// This function listens for Profile upsert requests and calls the needed saga.
export function* watchProfileUpsertRequestsSaga(
  createOrUpdateProfile: ReturnType<
    typeof BackendClient
  >["createOrUpdateProfile"]
): Iterator<Effect> {
  yield takeLatest(
    getType(profileUpsert.request),
    createOrUpdateProfileSaga,
    createOrUpdateProfile
  );
}

// This function listens for Profile refresh requests and calls the needed saga.
export function* watchProfileRefreshRequestsSaga(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Iterator<Effect> {
  yield takeLatest(getType(profileLoadRequest), loadProfile, getProfile);
}

// make a request to start the email validation process that sends to the user
// an email with a link to validate it
export function* startEmailValidationProcessSaga(
  startEmailValidationProcess: ReturnType<
    typeof BackendClient
  >["startEmailValidationProcess"]
): Iterator<Effect | Option<InitializedProfile>> {
  try {
    const response: SagaCallReturnType<
      typeof startEmailValidationProcess
    > = yield call(startEmailValidationProcess, {});
    // we got an error, throw it
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }
    if (response.value.status === 202) {
      yield put(startEmailValidation.success());
      return some(response.value.value);
    }
    if (response.value.status === 401) {
      // in case we got an expired session while loading the profile, we reset
      // the session
      yield put(sessionExpired());
    }
    throw response
      ? Error(`response status ${response.value.status}`)
      : Error(I18n.t("profile.errors.load"));
  } catch (error) {
    yield put(startEmailValidation.failure(error));
  }
  return none;
}

// This function listens for request to send again the email validation to profile email and calls the needed saga.
export function* watchProfileSendEmailValidationSaga(
  startEmailValidationProcess: ReturnType<
    typeof BackendClient
  >["startEmailValidationProcess"]
): Iterator<Effect> {
  yield takeLatest(
    getType(startEmailValidation.request),
    startEmailValidationProcessSaga,
    startEmailValidationProcess
  );
}

/**
 * A saga that manages the Profile.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import { AppVersion } from "../../definitions/backend/AppVersion";
import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../definitions/backend/ServicesPreferencesMode";
import { UpdateProfile412ErrorTypesEnum } from "../../definitions/backend/UpdateProfile412ErrorTypes";
import { UserDataProcessingChoiceEnum } from "../../definitions/backend/UserDataProcessingChoice";
import { BackendClient } from "../api/backend";
import { tosVersion } from "../config";
import { bpdLoadActivationStatus } from "../features/bonus/bpd/store/actions/details";
import { bpdEnabledSelector } from "../features/bonus/bpd/store/reducers/details/activation";
import { cgnDetails } from "../features/bonus/cgn/store/actions/details";
import { cgnDetailSelector } from "../features/bonus/cgn/store/reducers/details";
import { withRefreshApiCall } from "../features/fastLogin/saga/utils";
import I18n from "../i18n";
import { mixpanelTrack } from "../mixpanel";
import { trackProfileLoadSuccess } from "../screens/profile/analytics";
import {
  differentProfileLoggedIn,
  setProfileHashedFiscalCode
} from "../store/actions/crossSessions";
import { navigateToRemoveAccountSuccess } from "../store/actions/navigation";
import {
  loadBonusBeforeRemoveAccount,
  profileLoadFailure,
  profileLoadRequest,
  profileLoadSuccess,
  profileUpsert,
  removeAccountMotivation,
  startEmailValidation
} from "../store/actions/profile";
import { upsertUserDataProcessing } from "../store/actions/userDataProcessing";
import { isCGNEnabledSelector } from "../store/reducers/backendStatus";
import { isDifferentFiscalCodeSelector } from "../store/reducers/crossSessions";
import { profileSelector } from "../store/reducers/profile";
import { ProfileError } from "../store/reducers/profileErrorType";
import { GlobalState } from "../store/reducers/types";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { getAppVersion } from "../utils/appVersion";
import { isTestEnv } from "../utils/environment";
import { convertUnknownToError } from "../utils/errors";
import { deletePin } from "../utils/keychain";
import {
  fromLocaleToPreferredLanguage,
  getLocalePrimaryWithFallback
} from "../utils/locale";
import { readablePrivacyReport } from "../utils/reporters";

// A saga to load the Profile.
export function* loadProfile(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Generator<
  ReduxSagaEffect,
  O.Option<InitializedProfile>,
  SagaCallReturnType<typeof getProfile>
> {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      getProfile({})
    )) as unknown as SagaCallReturnType<typeof getProfile>;
    // we got an error, throw it
    if (E.isLeft(response)) {
      throw Error(readablePrivacyReport(response.left));
    }
    if (response.right.status === 200) {
      // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
      // BEWARE: we need to cast to UserProfileUnion to make UserProfile a
      // discriminated union!
      // eslint-disable-next-line
      yield* put(
        profileLoadSuccess(response.right.value as InitializedProfile)
      );
      return O.some(response.right.value);
    }
    throw response
      ? Error(`response status ${response.right.status}`)
      : Error(I18n.t("profile.errors.load"));
  } catch (e) {
    yield* put(profileLoadFailure(convertUnknownToError(e)));
  }
  return O.none;
}

// A saga to update the Profile.
// eslint-disable-next-line sonarjs/cognitive-complexity
function* createOrUpdateProfileSaga(
  createOrUpdateProfile: ReturnType<
    typeof BackendClient
  >["createOrUpdateProfile"],
  action: ActionType<(typeof profileUpsert)["request"]>
): Generator<ReduxSagaEffect, void, any> {
  // Get the current Profile from the state
  const profileState: ReturnType<typeof profileSelector> = yield* select(
    profileSelector
  );

  if (pot.isNone(profileState)) {
    // something's wrong, we don't even have an AuthenticatedProfile meaning
    // the user didn't yet authenticated: ignore this upsert request.
    return;
  }

  const currentProfile = profileState.value;

  const rawAppVersion = yield* call(getAppVersion);

  const appVersion = pipe(
    rawAppVersion,
    AppVersion.decode,
    E.fold(
      () => undefined,
      version => version
    )
  );

  const preferred_languages = [
    fromLocaleToPreferredLanguage(getLocalePrimaryWithFallback())
  ];

  // If we already have a profile, merge it with the new updated attributes
  // or else, create a new profile from the provided object
  // FIXME: perhaps this is responsibility of the caller?
  const newProfile: ExtendedProfile = currentProfile.has_profile
    ? {
        service_preferences_settings:
          currentProfile.service_preferences_settings,
        is_inbox_enabled: currentProfile.is_inbox_enabled,
        is_webhook_enabled: currentProfile.is_webhook_enabled,
        is_email_validated: currentProfile.is_email_validated || false,
        is_email_already_taken: !!currentProfile.is_email_already_taken,
        is_email_enabled: currentProfile.is_email_enabled,
        version: currentProfile.version,
        email: currentProfile.email,
        preferred_languages:
          currentProfile.preferred_languages ?? preferred_languages,
        blocked_inbox_or_channels: currentProfile.blocked_inbox_or_channels,
        accepted_tos_version: currentProfile.accepted_tos_version,
        last_app_version: currentProfile.last_app_version ?? appVersion,
        push_notifications_content_type:
          currentProfile.push_notifications_content_type,
        reminder_status: currentProfile.reminder_status,
        ...action.payload
      }
    : {
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.LEGACY
        },
        is_inbox_enabled: false,
        is_webhook_enabled: false,
        is_email_validated: action.payload.is_email_validated || false,
        is_email_enabled: action.payload.is_email_enabled || false,
        is_email_already_taken: !!currentProfile.is_email_already_taken,
        last_app_version: currentProfile.last_app_version ?? appVersion,
        ...action.payload,
        accepted_tos_version: tosVersion,
        version: 0
      };
  try {
    const response = (yield* call(
      withRefreshApiCall,
      createOrUpdateProfile({
        body: newProfile
      }),
      undefined,
      undefined,
      true
    )) as unknown as SagaCallReturnType<typeof createOrUpdateProfile>;

    if (E.isLeft(response)) {
      throw new Error(readablePrivacyReport(response.left));
    }
    if (response.right.status === 401) {
      return;
    }
    if (response.right.status === 409) {
      // It could happen that profile update fails due to version number mismatch
      // app has a different version of profile compared to that one owned by the backend
      // so we force profile reloading (see https://www.pivotaltracker.com/n/projects/2048617/stories/171994417)
      yield* put(profileLoadRequest());
      throw new ProfileError(
        response.right.value.title,
        "PROFILE_EMAIL_VALIDATION_ERROR"
      );
    }
    if (
      response.right.status === 412 &&
      response.right.value.type ===
        UpdateProfile412ErrorTypesEnum[
          "https://ioapp.it/problems/email-already-taken"
        ]
    ) {
      throw new ProfileError(
        response.right.value.title,
        "PROFILE_EMAIL_IS_NOT_UNIQUE_ERROR"
      );
    }

    if (response.right.status !== 200) {
      // We got a error, send a SESSION_UPSERT_FAILURE action
      throw new Error(
        response.right.value?.title ??
          `Profile upsert: received successful non-200 HTTP response with no "title" parameter in the body`
      );
    } else {
      // Ok we got a valid response, send a SESSION_UPSERT_SUCCESS action
      yield* put(
        profileUpsert.success({
          value: currentProfile,
          newValue: response.right.value
        })
      );
    }
  } catch (e) {
    const error = e
      ? convertUnknownToError(e)
      : Error(I18n.t("profile.errors.upsert"));

    yield* put(profileUpsert.failure(error));
  }
}

/**
 * collection of predicates to forward chosen information:
 * - first element contains the handler to check if the event should be dispatched
 * - second element contains the callback to execute if the first element condition is verified
 */
const profileChangePredicates: ReadonlyArray<
  [
    (value: InitializedProfile, newValue: InitializedProfile) => boolean,
    (value: InitializedProfile) => Promise<void> | undefined
  ]
> = [
  [
    (value, newValue) => value.is_email_enabled !== newValue.is_email_enabled,
    value =>
      mixpanelTrack("EMAIL_FORWARDING_MODE_SET", {
        mode: value.is_email_enabled ? "ALL" : "NONE"
      })
  ],
  [
    (value, newValue) =>
      value.service_preferences_settings.mode !==
      newValue.service_preferences_settings.mode,
    value =>
      mixpanelTrack("SERVICE_CONTACT_MODE_SET", {
        mode: value.service_preferences_settings.mode
      })
  ]
];

// execute a list of predicates to detect interesting scenario and execute action when profile changes
function* handleProfileChangesSaga(
  action: ActionType<(typeof profileUpsert)["success"]>
) {
  const { value, newValue } = action.payload;

  for (const item of profileChangePredicates) {
    if (item[0](value, newValue)) {
      yield* call(item[1], newValue);
    }
  }
}

// This function listens for Profile upsert requests and calls the needed saga.
export function* watchProfileUpsertRequestsSaga(
  createOrUpdateProfile: ReturnType<
    typeof BackendClient
  >["createOrUpdateProfile"]
): Iterator<ReduxSagaEffect> {
  yield* takeLatest(
    getType(profileUpsert.request),
    createOrUpdateProfileSaga,
    createOrUpdateProfile
  );

  yield* takeLatest(getType(profileUpsert.success), handleProfileChangesSaga);
}

// This function listens for Profile refresh requests and calls the needed saga.
export function* watchProfileRefreshRequestsSaga(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Iterator<ReduxSagaEffect> {
  yield* takeLatest(getType(profileLoadRequest), loadProfile, getProfile);
}

// make a request to start the email validation process that sends to the user
// an email with a link to validate it
function* startEmailValidationProcessSaga(
  startEmailValidationProcess: ReturnType<
    typeof BackendClient
  >["startEmailValidationProcess"]
): Generator<
  ReduxSagaEffect,
  void,
  SagaCallReturnType<typeof startEmailValidationProcess>
> {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      startEmailValidationProcess({})
    )) as unknown as SagaCallReturnType<typeof startEmailValidationProcess>;
    // we got an error, throw it
    if (E.isLeft(response)) {
      throw Error(readablePrivacyReport(response.left));
    }
    if (response.right.status === 202) {
      yield* put(startEmailValidation.success());
      return;
    }
    throw response
      ? Error(`response status ${response.right.status}`)
      : Error(I18n.t("profile.errors.load"));
  } catch (e) {
    yield* put(startEmailValidation.failure(convertUnknownToError(e)));
  }
}

function* handleLoadBonusBeforeRemoveAccount() {
  const bpdActive: ReturnType<typeof bpdEnabledSelector> = yield* select(
    bpdEnabledSelector
  );

  // check if there are some bpd
  if (pot.isNone(bpdActive)) {
    // Load the bpd data and wait for a response
    yield* put(bpdLoadActivationStatus.request());

    yield* take([
      bpdLoadActivationStatus.success,
      bpdLoadActivationStatus.failure
    ]);
  }

  const cgnActive: ReturnType<typeof cgnDetailSelector> = yield* select(
    cgnDetailSelector
  );

  const isCgnEnabled: ReturnType<typeof isCGNEnabledSelector> = yield* select(
    isCGNEnabledSelector
  );

  if (pot.isNone(cgnActive) && isCgnEnabled) {
    // Load the cgn data and wait for a response
    yield* put(cgnDetails.request());

    yield* take([cgnDetails.success, cgnDetails.failure]);
  }
}

// watch for action of removing account
function* handleRemoveAccount() {
  // dispatch an action to request account deletion
  yield* put(
    upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
  );
  // wait for response (success/failure)
  const upsertUserDataProcessingResponse = yield* take<
    ActionType<
      | typeof upsertUserDataProcessing.success
      | typeof upsertUserDataProcessing.failure
    >
  >([upsertUserDataProcessing.success, upsertUserDataProcessing.failure]);

  // if success go to remove account success screen
  if (
    isActionOf(
      upsertUserDataProcessing.success,
      upsertUserDataProcessingResponse
    )
  ) {
    yield* call(navigateToRemoveAccountSuccess);
  }
}

/**
 * check if the current logged profile fiscal code is the same of the previous stored one
 * @param profileLoadSuccessAction
 */
function* checkStoreHashedFiscalCode(
  profileLoadSuccessAction: ActionType<typeof profileLoadSuccess>
) {
  const checkIsDifferentFiscalCode: boolean | undefined = yield* select(
    isDifferentFiscalCodeSelector,
    profileLoadSuccessAction.payload.fiscal_code
  );
  // the current logged user has a different fiscal code from the stored hashed one or there isn't a stored one
  if (
    checkIsDifferentFiscalCode === true ||
    checkIsDifferentFiscalCode === undefined
  ) {
    // delete current store pin
    yield* call(deletePin);
    yield* put(
      differentProfileLoggedIn({
        isNewInstall: checkIsDifferentFiscalCode === undefined
      })
    );
  }
  yield* put(
    setProfileHashedFiscalCode(profileLoadSuccessAction.payload.fiscal_code)
  );
}

// make some check after the profile is loaded successfully
function* checkLoadedProfile(
  profileLoadSuccessAction: ActionType<typeof profileLoadSuccess>
) {
  const state = (yield* select()) as GlobalState;
  void trackProfileLoadSuccess(state);

  yield* call(checkStoreHashedFiscalCode, profileLoadSuccessAction);
  // If the tos has never been accepted or is not part of the upsert payload, do not run check that could upsert profile
  if (!profileLoadSuccessAction.payload.accepted_tos_version) {
    return;
  }
  // This saga will upsert the `last_app_version` value in the
  // profile only if it actually changed from the one stored in
  // the backend.
  yield* call(upsertAppVersionSaga);
}

// watch for some actions about profile
export function* watchProfile(
  startEmailValidationProcess: ReturnType<
    typeof BackendClient
  >["startEmailValidationProcess"]
): Iterator<ReduxSagaEffect> {
  // user requests to send again the email validation to profile email
  yield* takeLatest(
    getType(startEmailValidation.request),
    startEmailValidationProcessSaga,
    startEmailValidationProcess
  );
  // check the loaded profile
  yield* takeLatest(getType(profileLoadSuccess), checkLoadedProfile);

  // Start watching for request bonus before remove profile
  yield* takeLatest(
    loadBonusBeforeRemoveAccount,
    handleLoadBonusBeforeRemoveAccount
  );
  // Start watching for request of remove profile
  yield* takeLatest(removeAccountMotivation, handleRemoveAccount);
}

/**
 * Upsert the user's latest app version, only if it's different
 * from the one stored in the backend.
 *
 * ⚠️ This saga will _block_ if the upsert request will be triggered
 * because of possible race conditions with the profile version.
 */
export function* upsertAppVersionSaga() {
  const profileState: ReturnType<typeof profileSelector> = yield* select(
    profileSelector
  );

  // If we don't have the profile inside the state there is
  // something wrong.
  if (pot.isNone(profileState)) {
    return;
  }

  const maybeStoredVersion = O.fromNullable(
    profileState.value.last_app_version
  );
  const rawAppVersion = yield* call(getAppVersion);
  const maybeAppVersion = O.fromEither(AppVersion.decode(rawAppVersion));

  // There was a problem decoding the local app version
  // using the regex from the backend. The upsert won't be
  // triggered in this case.
  if (O.isNone(maybeAppVersion)) {
    return;
  }

  // If the stored app version is the same as the
  // current one, we are going to skip the upsert.
  const isSameVersion = pipe(
    maybeStoredVersion,
    O.elem(S.Eq)(maybeAppVersion.value)
  );

  if (isSameVersion) {
    return;
  }

  const requestAction = yield* call(profileUpsert.request, {
    last_app_version: maybeAppVersion.value
  });

  yield* put(requestAction);

  // Here we are waiting for the response in order to block
  // other possible upsert requests that would cause a race
  // condition with the profile version number.
  yield* take([profileUpsert.success, profileUpsert.failure]);
}

// to ensure right code encapsulation we export functions/variables just for tests purposes
export const profileSagaTestable = isTestEnv
  ? {
      startEmailValidationProcessSaga,
      checkLoadedProfile,
      handleLoadBonusBeforeRemoveAccount,
      handleRemoveAccount,
      checkStoreHashedFiscalCode,
      createOrUpdateProfileSaga
    }
  : undefined;

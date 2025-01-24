/* eslint-disable no-fallthrough */
// disabled in order to allows comments between the switch
import { getType } from "typesafe-actions";

import trackCgnAction from "../../features/bonus/cgn/analytics/index";
import { loadAvailableBonuses } from "../../features/bonus/common/store/actions/availableBonusesTypes";
import trackFciAction from "../../features/fci/analytics";
import { fciEnvironmentSelector } from "../../features/fci/store/reducers/fciEnvironment";
import trackZendesk from "../../features/zendesk/analytics/index";
import { mixpanel } from "../../mixpanel";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../actions/analytics";
import { applicationChangeState } from "../actions/application";
import {
  idpLoginUrlChanged,
  idpSelected,
  loginFailure,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  sessionExpired,
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../actions/authentication";
import { cieAuthenticationError } from "../actions/cie";
import { contentMunicipalityLoad } from "../actions/content";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationPinReset,
  identificationRequest,
  identificationStart,
  identificationSuccess
} from "../actions/identification";
import {
  profileFirstLogin,
  profileLoadFailure,
  profileLoadRequest,
  profileUpsert,
  removeAccountMotivation
} from "../actions/profile";
import { profileEmailValidationChanged } from "../actions/profileEmailValidationChange";
import { searchMessagesEnabled } from "../actions/search";
import { Action, Dispatch, MiddlewareAPI } from "../actions/types";
import {
  deleteUserDataProcessing,
  upsertUserDataProcessing
} from "../actions/userDataProcessing";
import { buildEventProperties } from "../../utils/analytics";
import { trackServicesAction } from "../../features/services/common/analytics";
import { trackMessagesActionsPostDispatch } from "../../features/messages/analytics";
import { trackContentAction } from "./contentAnalytics";

const trackAction =
  (mp: NonNullable<typeof mixpanel>) =>
  // eslint-disable-next-line complexity
  (action: Action): void | ReadonlyArray<null> => {
    switch (action.type) {
      //
      // Application state actions
      //
      case getType(applicationChangeState):
        return mp.track("APP_STATE_CHANGE", {
          APPLICATION_STATE_NAME: action.payload
        });
      //
      // Authentication actions (with properties)
      //
      case getType(idpSelected):
        return mp.track(action.type, {
          SPID_IDP_ID: action.payload.id,
          SPID_IDP_NAME: action.payload.name
        });

      case getType(idpLoginUrlChanged):
        return mp.track(action.type, {
          SPID_URL: action.payload.url
        });

      // dispatch to mixpanel when the email is validated
      case getType(profileEmailValidationChanged):
        return mp.track(action.type, { isEmailValidated: action.payload });

      case getType(upsertUserDataProcessing.failure):
      case getType(logoutFailure):
        return mp.track(action.type, {
          reason: action.payload.error.message
        });
      // Failures with reason as Error and optional description
      case getType(cieAuthenticationError):
        return mp.track(action.type, action.payload);
      // Failures with reason as Error
      case getType(sessionInformationLoadFailure):
      case getType(profileLoadFailure):
      case getType(profileUpsert.failure):
      //  Bonus vacanze
      case getType(loadAvailableBonuses.failure):
        return mp.track(action.type, {
          reason: action.payload.message
        });
      // track when a missing municipality is detected
      case getType(contentMunicipalityLoad.failure):
        return mp.track(action.type, {
          reason: action.payload.error.message,
          codice_catastale: action.payload.codiceCatastale
        });
      // download / delete profile
      case getType(upsertUserDataProcessing.success):
        return mp.track(action.type, action.payload);
      //
      // Actions (without properties)
      //
      // authentication
      case getType(loginFailure):
        return mp.track(action.type, {
          idp: action.payload.idp,
          reason: action.payload.error.message
        });
      case getType(loginSuccess):
        return mp.track(action.type, {
          idp: action.payload.idp
        });
      case getType(analyticsAuthenticationStarted):
      case getType(analyticsAuthenticationCompleted):
      case getType(sessionInformationLoadSuccess):
      case getType(sessionExpired):
      case getType(sessionInvalid):
      case getType(logoutSuccess):
      // identification
      // identificationSuccess is handled separately
      // because it has a payload.
      case getType(identificationRequest):
      case getType(identificationStart):
      case getType(identificationCancel):
      case getType(identificationFailure):
      case getType(identificationPinReset):
      case getType(identificationForceLogout):
      // profile
      case getType(profileUpsert.success):
      case getType(profileLoadRequest):
      // messages
      case getType(searchMessagesEnabled):
      //  profile First time Login
      case getType(profileFirstLogin):
      // other
      case getType(loadAvailableBonuses.success):
      case getType(loadAvailableBonuses.request):
        return mp.track(action.type);

      case getType(deleteUserDataProcessing.request):
        return mp.track(action.type, { choice: action.payload });
      case getType(removeAccountMotivation):
      case getType(deleteUserDataProcessing.success):
        return mp.track(action.type, action.payload);
      case getType(deleteUserDataProcessing.failure):
        return mp.track(action.type, {
          choice: action.payload.choice,
          reason: action.payload.error.message
        });
      // identification: identificationSuccess
      case getType(identificationSuccess):
        return mp.track(
          action.type,
          buildEventProperties("UX", "confirm", {
            identification_method: action.payload.isBiometric ? "bio" : "pin"
          })
        );
    }
  };

/*
 * The middleware acts as a general hook in order to track any meaningful action
 */
export const actionTracking =
  (middleware: MiddlewareAPI) =>
  (next: Dispatch) =>
  (action: Action): Action => {
    if (mixpanel !== undefined) {
      // Call mixpanel tracking only after we have
      // initialized mixpanel with the API token

      // Be aware that, at this point, tracking is called before
      // the action has been dispatched to the redux store
      void trackAction(mixpanel)(action);
      void trackCgnAction(mixpanel)(action);
      void trackContentAction(mixpanel)(action);
      void trackServicesAction(mixpanel)(action);
      void trackZendesk(mixpanel)(action);

      const fciEnvironment = fciEnvironmentSelector(middleware.getState());
      void trackFciAction(mixpanel, fciEnvironment)(action);
    }
    // This dispatches the action towards the redux store
    const result = next(action);
    if (mixpanel !== undefined) {
      // Call mixpanel tracking only after we have
      // initialized mixpanel with the API token

      // Be aware that, at this point, tracking is called after
      // the action has been dispatched to the redux store
      trackMessagesActionsPostDispatch(action, middleware.getState());
    }
    return result;
  };

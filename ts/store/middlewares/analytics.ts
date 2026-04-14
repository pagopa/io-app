/* eslint-disable no-fallthrough */
// disabled in order to allows comments between the switch
import { getType } from "typesafe-actions";
import { isTestEnv } from "../../utils/environment";
import { isMixpanelInstanceInitialized, mixpanelTrack } from "../../mixpanel";
import trackCgnAction from "../../features/bonus/cgn/analytics/index";
import { loadAvailableBonuses } from "../../features/bonus/common/store/actions/availableBonusesTypes";
import trackFciAction from "../../features/fci/analytics";
import { fciEnvironmentSelector } from "../../features/fci/store/reducers/fciEnvironment";
import trackZendesk from "../../features/zendesk/analytics/index";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../actions/analytics";
import { applicationChangeState } from "../actions/application";
import {
  clearCurrentSession,
  idpLoginUrlChanged,
  idpSelected,
  loginFailure,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  sessionCorrupted,
  sessionExpired,
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../../features/authentication/common/store/actions";
import { cieAuthenticationError } from "../../features/authentication/login/cie/store/actions";
import { contentMunicipalityLoad } from "../actions/content";
import {
  profileFirstLogin,
  profileLoadFailure,
  profileLoadRequest,
  profileUpsert,
  removeAccountMotivation
} from "../../features/settings/common/store/actions";
import { profileEmailValidationChanged } from "../../features/mailCheck/store/actions/profileEmailValidationChange";
import { searchMessagesEnabled } from "../actions/search";
import { Action, Dispatch, MiddlewareAPI } from "../actions/types";
import {
  deleteUserDataProcessing,
  upsertUserDataProcessing
} from "../../features/settings/common/store/actions/userDataProcessing";
import { buildEventProperties } from "../../utils/analytics";
import { trackServicesAction } from "../../features/services/common/analytics";
import { trackMessagesActionsPostDispatch } from "../../features/messages/analytics";
import { trackIdentificationAction } from "../../features/identification/analytics";
import { updateOfflineAccessReason } from "../../features/itwallet/analytics/properties/propertyUpdaters";
import {
  trackLoginFailure,
  trackLogoutFailure,
  trackLogoutSuccess
} from "../../features/authentication/common/analytics";
import { trackSessionCorrupted } from "../../features/authentication/activeSessionLogin/analytics";
import { trackContentAction } from "./contentAnalytics";

const trackAction =
  // eslint-disable-next-line complexity
  (action: Action): void | ReadonlyArray<null> => {
    switch (action.type) {
      //
      // Application state actions
      //
      case getType(applicationChangeState):
        return mixpanelTrack("APP_STATE_CHANGE", {
          APPLICATION_STATE_NAME: action.payload
        });
      //
      // Authentication actions (with properties)
      //
      case getType(idpSelected):
        return mixpanelTrack(action.type, {
          SPID_IDP_ID: action.payload.id,
          SPID_IDP_NAME: action.payload.name
        });

      case getType(idpLoginUrlChanged):
        return mixpanelTrack(action.type, {
          SPID_URL: action.payload.url
        });

      // dispatch to mixpanel when the email is validated
      case getType(profileEmailValidationChanged):
        return mixpanelTrack(action.type, { isEmailValidated: action.payload });
      case getType(logoutFailure):
        return trackLogoutFailure(action.payload.error.message);
      case getType(upsertUserDataProcessing.failure):
        return mixpanelTrack(action.type, {
          reason: action.payload.error.message
        });
      // Failures with reason as Error and optional description
      case getType(cieAuthenticationError):
        return mixpanelTrack(
          action.type,
          buildEventProperties("KO", undefined, action.payload)
        );
      // Failures with reason as Error
      case getType(sessionInformationLoadFailure):
      case getType(profileLoadFailure):
      case getType(profileUpsert.failure):
      //  Bonus vacanze
      case getType(loadAvailableBonuses.failure):
        return mixpanelTrack(action.type, {
          reason: action.payload.message
        });
      // track when a missing municipality is detected
      case getType(contentMunicipalityLoad.failure):
        return mixpanelTrack(action.type, {
          reason: action.payload.error.message,
          codice_catastale: action.payload.codiceCatastale
        });
      // download / delete profile
      case getType(upsertUserDataProcessing.success):
        return mixpanelTrack(action.type, action.payload);
      //
      // Actions (without properties)
      //
      // authentication
      case getType(loginFailure):
        return trackLoginFailure({
          idp: action.payload.idp,
          reason: action.payload.error.message,
          flow: "auth"
        });

      case getType(loginSuccess):
        return mixpanelTrack(action.type, {
          idp: action.payload.idp
        });
      case getType(clearCurrentSession):
        return mixpanelTrack(
          action.type,
          buildEventProperties("TECH", undefined)
        );
      case getType(analyticsAuthenticationStarted):
      case getType(analyticsAuthenticationCompleted):
        return mixpanelTrack(
          action.type,
          buildEventProperties("TECH", undefined, {
            flow: action.payload
          })
        );
      case getType(logoutSuccess):
        return trackLogoutSuccess();
      case getType(sessionCorrupted):
        return trackSessionCorrupted();
      case getType(sessionInformationLoadSuccess):
      case getType(sessionExpired):
      case getType(sessionInvalid):

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
        return mixpanelTrack(action.type);

      case getType(deleteUserDataProcessing.request):
        return mixpanelTrack(action.type, { choice: action.payload });
      case getType(removeAccountMotivation):
      case getType(deleteUserDataProcessing.success):
        return mixpanelTrack(action.type, action.payload);
      case getType(deleteUserDataProcessing.failure):
        return mixpanelTrack(action.type, {
          choice: action.payload.choice,
          reason: action.payload.error.message
        });
    }
  };

/*
 * The middleware acts as a general hook in order to track any meaningful action
 */
export const actionTracking =
  (middleware: MiddlewareAPI) =>
  (next: Dispatch) =>
  (action: Action): Action => {
    if (isMixpanelInstanceInitialized()) {
      // Call mixpanel tracking only after we have
      // initialized mixpanel with the API token

      // Be aware that, at this point, tracking is called before
      // the action has been dispatched to the redux store
      void trackAction(action);
      void trackCgnAction(action);
      void trackContentAction(action);
      void trackServicesAction(action);
      void trackZendesk(action);
      void trackIdentificationAction(action);

      // Define MP super property that indicates the reason for offline access
      void updateOfflineAccessReason(action);

      const fciEnvironment = fciEnvironmentSelector(middleware.getState());
      void trackFciAction(fciEnvironment)(action);
    }
    // This dispatches the action towards the redux store
    const result = next(action);
    if (isMixpanelInstanceInitialized()) {
      // Call mixpanel tracking only after we have
      // initialized mixpanel with the API token

      // Be aware that, at this point, tracking is called after
      // the action has been dispatched to the redux store
      trackMessagesActionsPostDispatch(action, middleware.getState());
    }
    return result;
  };

export const testable = isTestEnv ? { trackAction } : undefined;

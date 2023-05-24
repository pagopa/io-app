/* eslint-disable no-fallthrough */
// disabled in order to allows comments between the switch
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import {
  loadAllBonusActivations,
  loadAvailableBonuses
} from "../../features/bonus/bonusVacanze/store/actions/bonusVacanze";

import trackBpdAction from "../../features/bonus/bpd/analytics/index";
import trackCdc from "../../features/bonus/cdc/analytics/index";
import trackCgnAction from "../../features/bonus/cgn/analytics/index";
import trackEuCovidCertificateActions from "../../features/euCovidCert/analytics/index";
import trackBancomatAction from "../../features/wallet/onboarding/bancomat/analytics/index";
import { trackBPayAction } from "../../features/wallet/onboarding/bancomatPay/analytics";
import { trackCoBadgeAction } from "../../features/wallet/onboarding/cobadge/analytics";
import trackPaypalOnboarding from "../../features/wallet/onboarding/paypal/analytics/index";
import trackFciAction from "../../features/fci/analytics";
import trackZendesk from "../../features/zendesk/analytics/index";
import { mixpanel } from "../../mixpanel";
import { getNetworkErrorMessage } from "../../utils/errors";
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
  removeMessages,
  migrateToPaginatedMessages
} from "../actions/messages";
import { setMixpanelEnabled } from "../actions/mixpanel";
import {
  notificationsInstallationTokenRegistered,
  updateNotificationInstallationFailure,
  updateNotificationsInstallationToken
} from "../actions/notifications";
import { tosAccepted } from "../actions/onboarding";
import { createPinSuccess } from "../actions/pinset";
import {
  profileFirstLogin,
  profileLoadFailure,
  profileLoadRequest,
  profileLoadSuccess,
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
import { userMetadataLoad, userMetadataUpsert } from "../actions/userMetadata";
import { deleteAllPaymentMethodsByFunction } from "../actions/wallet/delete";
import {
  addCreditCardOutcomeCode,
  paymentOutcomeCode
} from "../actions/wallet/outcomeCode";
import {
  abortRunningPayment,
  paymentAttiva,
  paymentCheck,
  paymentCompletedSuccess,
  paymentDeletePayment,
  paymentExecuteStart,
  paymentIdPolling,
  paymentInitializeState,
  paymentUpdateWalletPsp,
  paymentVerifica,
  paymentWebViewEnd
} from "../actions/wallet/payment";
import {
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsSuccess
} from "../actions/wallet/transactions";
import {
  addCreditCardWebViewEnd,
  addWalletCreditCardFailure,
  addWalletCreditCardInit,
  addWalletCreditCardRequest,
  addWalletNewCreditCardFailure,
  addWalletNewCreditCardSuccess,
  deleteWalletFailure,
  deleteWalletRequest,
  deleteWalletSuccess,
  refreshPMTokenWhileAddCreditCard,
  setFavouriteWalletFailure,
  setFavouriteWalletRequest,
  setFavouriteWalletSuccess,
  updatePaymentStatus
} from "../actions/wallet/wallets";
import { trackContentAction } from "./contentAnalytics";
import { trackServiceAction } from "./serviceAnalytics";

const trackAction =
  (mp: NonNullable<typeof mixpanel>) =>
  // eslint-disable-next-line complexity
  (action: Action): Promise<void | ReadonlyArray<null>> => {
    // eslint-disable-next-line sonarjs/max-switch-cases
    switch (action.type) {
      //
      // Application state actions
      //
      case getType(applicationChangeState):
        return mp.track("APP_STATE_CHANGE", {
          APPLICATION_STATE_NAME: action.payload
        });
      //
      // Onboarding (with properties)
      //
      case getType(tosAccepted):
        return mp.track(action.type, {
          acceptedTosVersion: action.payload
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

      case getType(fetchTransactionsSuccess):
        return mp.track(action.type, {
          count: action.payload.data.length,
          total: O.getOrElse(() => -1)(action.payload.total)
        });
      // end pay webview Payment (payment + onboarding credit card) actions (with properties)
      case getType(addCreditCardWebViewEnd):
        return mp.track(action.type, {
          exitType: action.payload
        });
      case getType(paymentOutcomeCode):
        return mp.track(action.type, {
          outCome: O.getOrElse(() => "")(action.payload.outcome),
          paymentMethodType: action.payload.paymentMethodType
        });
      case getType(addCreditCardOutcomeCode):
        return mp.track(action.type, {
          outCome: O.getOrElse(() => "")(action.payload)
        });
      case getType(paymentWebViewEnd):
        return mp.track(action.type, {
          exitType: action.payload.reason,
          paymentMethodType: action.payload.paymentMethodType
        });
      //
      // Payment actions (with properties)
      //
      case getType(paymentAttiva.request):
      case getType(paymentVerifica.request):
        return mp.track(action.type, {
          organizationFiscalCode: action.payload.rptId.organizationFiscalCode,
          paymentNoticeNumber: action.payload.rptId.paymentNoticeNumber
        });
      case getType(paymentVerifica.success):
        return mp.track(action.type, {
          amount: action.payload.importoSingoloVersamento
        });
      case getType(paymentCompletedSuccess):
        // PaymentCompletedSuccess may be generated by a completed payment or
        // by a verifica operation that return a duplicated payment error.
        // Only in the former case we have a transaction and an amount.
        if (action.payload.kind === "COMPLETED") {
          const amount = action.payload.transaction?.amount.amount;
          return mp
            .track(action.type, {
              amount,
              kind: action.payload.kind
            })
            .then(_ => mp.trackCharge(amount ?? -1));
        } else {
          return mp.track(action.type, {
            kind: action.payload.kind
          });
        }
      //
      // Wallet / payment failure actions (reason in the payload)
      //
      case getType(addWalletCreditCardFailure):
        return mp.track(action.type, {
          reason: action.payload.kind,
          // only GENERIC_ERROR could have details of the error
          error:
            action.payload.kind === "GENERIC_ERROR"
              ? action.payload.reason
              : "n/a"
        });
      case getType(addWalletNewCreditCardFailure):
        return mp.track(action.type);

      case getType(paymentAttiva.failure):
      case getType(paymentVerifica.failure):
      case getType(paymentIdPolling.failure):
      case getType(paymentCheck.failure):
        return mp.track(action.type, {
          reason: action.payload
        });
      case getType(updatePaymentStatus.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });

      // Messages actions with properties
      case getType(removeMessages): {
        return mp.track(action.type, {
          messagesIdsToRemoveFromCache: action.payload
        });
      }
      case getType(migrateToPaginatedMessages.request): {
        return mp.track("MESSAGES_MIGRATION_START", {
          total: Object.keys(action.payload).length
        });
      }
      case getType(migrateToPaginatedMessages.success): {
        return mp.track("MESSAGES_MIGRATION_SUCCESS", {
          total: action.payload
        });
      }
      case getType(migrateToPaginatedMessages.failure): {
        return mp.track("MESSAGES_MIGRATION_FAILURE", {
          failed: action.payload.failed.length,
          succeeded: action.payload.succeeded.length
        });
      }
      // logout / load message / delete wallets / failure
      case getType(deleteAllPaymentMethodsByFunction.failure):
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
      case getType(userMetadataUpsert.failure):
      case getType(userMetadataLoad.failure):
      case getType(refreshPMTokenWhileAddCreditCard.failure):
      case getType(deleteWalletFailure):
      case getType(setFavouriteWalletFailure):
      case getType(fetchTransactionsFailure):
      case getType(paymentDeletePayment.failure):
      case getType(paymentUpdateWalletPsp.failure):
      case getType(paymentExecuteStart.failure):
      case getType(updateNotificationInstallationFailure):
      //  Bonus vacanze
      case getType(loadAllBonusActivations.failure):
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
      // wallet
      case getType(updatePaymentStatus.success):
        return mp.track(action.type, {
          pagoPA: action.payload.paymentMethod?.pagoPA
        });
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
      case getType(identificationRequest):
      case getType(identificationStart):
      case getType(identificationCancel):
      case getType(identificationSuccess):
      case getType(identificationFailure):
      case getType(identificationPinReset):
      case getType(identificationForceLogout):
      // onboarding
      case getType(createPinSuccess):
      // profile
      case getType(profileUpsert.success):
      case getType(profileLoadRequest):
      case getType(profileLoadSuccess):
      // userMetadata
      case getType(userMetadataUpsert.request):
      case getType(userMetadataUpsert.success):
      case getType(userMetadataLoad.request):
      case getType(userMetadataLoad.success):
      // messages
      case getType(searchMessagesEnabled):
      // wallet
      case getType(addWalletCreditCardInit):
      case getType(addWalletCreditCardRequest):
      case getType(addWalletNewCreditCardSuccess):
      case getType(deleteAllPaymentMethodsByFunction.request):
      case getType(deleteAllPaymentMethodsByFunction.success):
      case getType(deleteWalletRequest):
      case getType(deleteWalletSuccess):
      case getType(setFavouriteWalletRequest):
      case getType(setFavouriteWalletSuccess):
      case getType(fetchTransactionsRequest):
      case getType(refreshPMTokenWhileAddCreditCard.request):
      case getType(refreshPMTokenWhileAddCreditCard.success):
      case getType(updatePaymentStatus.request):
      // payment
      case getType(abortRunningPayment):
      case getType(paymentInitializeState):
      case getType(paymentAttiva.success):
      case getType(paymentIdPolling.request):
      case getType(paymentIdPolling.success):
      case getType(paymentCheck.request):
      case getType(paymentCheck.success):
      case getType(paymentExecuteStart.request):
      case getType(paymentExecuteStart.success):
      case getType(paymentUpdateWalletPsp.request):
      case getType(paymentUpdateWalletPsp.success):
      case getType(paymentDeletePayment.request):
      case getType(paymentDeletePayment.success):
      //  profile First time Login
      case getType(profileFirstLogin):
      // other
      case getType(updateNotificationsInstallationToken):
      case getType(notificationsInstallationTokenRegistered):
      case getType(loadAllBonusActivations.request):
      case getType(loadAvailableBonuses.success):
      case getType(loadAvailableBonuses.request):
        return mp.track(action.type);

      case getType(loadAllBonusActivations.success):
        return mp.track(action.type, {
          count: action.payload.length
        });

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
      case getType(setMixpanelEnabled):
        return mp.track(action.type, {
          value: action.payload
        });
    }
    return Promise.resolve();
  };

/*
 * The middleware acts as a general hook in order to track any meaningful action
 */
export const actionTracking =
  (_: MiddlewareAPI) =>
  (next: Dispatch) =>
  (action: Action): Action => {
    if (mixpanel !== undefined) {
      // call mixpanel tracking only after we have initialized mixpanel with the
      // API token
      void trackAction(mixpanel)(action);
      void trackBpdAction(mixpanel)(action);
      void trackBancomatAction(mixpanel)(action);
      // TODO: activate simultaneously with the activation of satispay
      // void trackSatispayAction(mixpanel)(action);
      void trackBPayAction(mixpanel)(action);
      void trackCoBadgeAction(mixpanel)(action);
      void trackCgnAction(mixpanel)(action);
      void trackContentAction(mixpanel)(action);
      void trackServiceAction(mixpanel)(action);
      void trackEuCovidCertificateActions(mixpanel)(action);
      void trackPaypalOnboarding(mixpanel)(action);
      void trackZendesk(mixpanel)(action);
      void trackCdc(mixpanel)(action);
      void trackFciAction(mixpanel)(action);
    }
    return next(action);
  };

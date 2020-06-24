import { constNull } from "fp-ts/lib/function";
import { sha256 } from "react-native-sha256";
import { NavigationActions } from "react-navigation";
import { getType } from "typesafe-actions";
import { BonusActivationWithQrCode } from "../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { EligibilityCheckSuccessEligible } from "../../../definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import { setInstabugUserAttribute } from "../../boot/configureInstabug";
import {
  activateBonusVacanze,
  cancelBonusVacanzeRequest,
  checkBonusVacanzeEligibility,
  completeBonusVacanzeActivation,
  loadAllBonusActivations,
  loadAvailableBonuses,
  loadBonusVacanzeFromId,
  storeEligibilityRequestId
} from "../../features/bonusVacanze/store/actions/bonusVacanze";
import { mixpanel } from "../../mixpanel";
import { format } from "../../utils/dates";
import { getCurrentRouteName } from "../../utils/navigation";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted,
  analyticsOnboardingStarted
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
import {
  contentMunicipalityLoad,
  loadServiceMetadata
} from "../actions/content";
import { instabugReportClosed, instabugReportOpened } from "../actions/debug";
import {
  identificationCancel,
  identificationFailure,
  identificationPinReset,
  identificationRequest,
  identificationStart,
  identificationSuccess
} from "../actions/identification";
import {
  loadMessage,
  loadMessages,
  loadMessagesCancel,
  removeMessages,
  setMessageReadState
} from "../actions/messages";
import {
  updateNotificationInstallationFailure,
  updateNotificationsInstallationToken
} from "../actions/notifications";
import { tosAccepted } from "../actions/onboarding";
import { createPinSuccess } from "../actions/pinset";
import {
  profileFirstLogin,
  profileLoadFailure,
  profileLoadSuccess,
  profileUpsert
} from "../actions/profile";
import { profileEmailValidationChanged } from "../actions/profileEmailValidationChange";
import { loadServiceDetail, loadVisibleServices } from "../actions/services";
import { Action, Dispatch, MiddlewareAPI } from "../actions/types";
import { upsertUserDataProcessing } from "../actions/userDataProcessing";
import { userMetadataLoad, userMetadataUpsert } from "../actions/userMetadata";
import {
  paymentAttiva,
  paymentCheck,
  paymentCompletedFailure,
  paymentCompletedSuccess,
  paymentDeletePayment,
  paymentExecutePayment,
  paymentFetchPspsForPaymentId,
  paymentIdPolling,
  paymentInitializeState,
  paymentUpdateWalletPsp,
  paymentVerifica
} from "../actions/wallet/payment";
import {
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsSuccess
} from "../actions/wallet/transactions";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardInit,
  addWalletCreditCardRequest,
  creditCardCheckout3dsRequest,
  creditCardCheckout3dsSuccess,
  deleteWalletFailure,
  deleteWalletRequest,
  deleteWalletSuccess,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  payCreditCardVerificationFailure,
  payCreditCardVerificationRequest,
  payCreditCardVerificationSuccess,
  setFavouriteWalletFailure,
  setFavouriteWalletRequest,
  setFavouriteWalletSuccess
} from "../actions/wallet/wallets";

// tslint:disable cognitive-complexity no-big-function
const trackAction = (mp: NonNullable<typeof mixpanel>) => (
  action: Action
): Promise<any> => {
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
    case getType(profileLoadSuccess):
      // as soon as we have the user fiscal code, attach the mixpanel
      // session to the hashed fiscal code of the user
      const fiscalnumber = action.payload.fiscal_code;
      const identify = sha256(fiscalnumber).then(hash => mp.identify(hash));
      return Promise.all([
        mp.track(action.type).then(constNull, constNull),
        identify.then(constNull, constNull)
      ]);
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
        total: action.payload.total.getOrElse(-1)
      });
    //
    // Wallet actions (with properties)
    //
    case getType(fetchWalletsSuccess):
      return mp.track(action.type, {
        count: action.payload.length
      });
    //
    // Payment actions (with properties)
    //
    case getType(paymentVerifica.request):
      return mp.track(action.type, {
        organizationFiscalCode: action.payload.organizationFiscalCode,
        paymentNoticeNumber: action.payload.paymentNoticeNumber
      });
    case getType(paymentVerifica.success):
      return mp.track(action.type, {
        amount: action.payload.importoSingoloVersamento
      });
    case getType(paymentAttiva.request):
      return mp.track(action.type, {
        organizationFiscalCode: action.payload.rptId.organizationFiscalCode,
        paymentNoticeNumber: action.payload.rptId.paymentNoticeNumber
      });
    case getType(paymentCompletedSuccess):
      // PaymentCompletedSuccess may be generated by a completed payment or
      // by a verifica operation that return a duplicated payment error.
      // Only in the former case we have a transaction and an amount.
      if (action.payload.kind === "COMPLETED") {
        const amount = action.payload.transaction.amount.amount;
        return mp
          .track(action.type, {
            amount,
            kind: action.payload.kind
          })
          .then(_ => mp.trackCharge(amount));
      } else {
        return mp.track(action.type, {
          kind: action.payload.kind
        });
      }
    //
    // Wallet / payment failure actions (reason in the payload)
    //
    case getType(addWalletCreditCardFailure):
    case getType(paymentAttiva.failure):
    case getType(paymentVerifica.failure):
    case getType(paymentIdPolling.failure):
    case getType(paymentCheck.failure):
      return mp.track(action.type, {
        reason: action.payload
      });

    // Messages actions with properties
    case getType(removeMessages): {
      return mp.track(action.type, {
        messagesIdsToRemoveFromCache: action.payload
      });
    }
    case getType(setMessageReadState): {
      if (action.payload.read === true) {
        setInstabugUserAttribute("lastSeenMessageID", action.payload.id);
      }
      return mp.track(action.type, action.payload);
    }

    // instabug
    case getType(instabugReportClosed):
    case getType(instabugReportOpened):
      return mp.track(action.type, action.payload);

    // logout / load message / failure
    case getType(upsertUserDataProcessing.failure):
    case getType(loadMessage.failure):
    case getType(logoutFailure):
    case getType(loadServiceDetail.failure):
    case getType(loadServiceMetadata.failure):
    // bonus vacanze
    case getType(loadBonusVacanzeFromId.failure):
      return mp.track(action.type, {
        reason: action.payload.error.message
      });
    // Failures with reason as Error
    case getType(sessionInformationLoadFailure):
    case getType(profileLoadFailure):
    case getType(profileUpsert.failure):
    case getType(userMetadataUpsert.failure):
    case getType(userMetadataLoad.failure):
    case getType(loginFailure):
    case getType(loadMessages.failure):
    case getType(loadVisibleServices.failure):
    case getType(fetchWalletsFailure):
    case getType(payCreditCardVerificationFailure):
    case getType(deleteWalletFailure):
    case getType(setFavouriteWalletFailure):
    case getType(fetchTransactionsFailure):
    case getType(paymentFetchPspsForPaymentId.failure):
    case getType(paymentExecutePayment.failure):
    case getType(paymentDeletePayment.failure):
    case getType(paymentUpdateWalletPsp.failure):
    case getType(updateNotificationInstallationFailure):
    // Bonus vacanze
    case getType(loadAllBonusActivations.failure):
    case getType(loadAvailableBonuses.failure):
    case getType(checkBonusVacanzeEligibility.failure):
    case getType(activateBonusVacanze.failure):
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
    case getType(analyticsAuthenticationStarted):
    case getType(analyticsAuthenticationCompleted):
    case getType(loginSuccess):
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
    // onboarding
    case getType(analyticsOnboardingStarted):
    case getType(createPinSuccess):
    // profile
    case getType(profileUpsert.success):
    // userMetadata
    case getType(userMetadataUpsert.request):
    case getType(userMetadataUpsert.success):
    case getType(userMetadataLoad.request):
    case getType(userMetadataLoad.success):
    // messages
    case getType(loadMessages.request):

    case getType(loadMessages.success):
    case getType(loadMessagesCancel):
    case getType(loadMessage.success):

    // services
    case getType(loadVisibleServices.request):
    case getType(loadVisibleServices.success):

    case getType(loadServiceDetail.request):
    case getType(loadServiceDetail.success):

    case getType(loadServiceMetadata.request):
    case getType(loadServiceMetadata.success):

    // wallet
    case getType(fetchWalletsRequest):

    case getType(addWalletCreditCardInit):
    case getType(addWalletCreditCardRequest):
    case getType(payCreditCardVerificationRequest):
    case getType(payCreditCardVerificationSuccess):
    case getType(creditCardCheckout3dsRequest):
    case getType(creditCardCheckout3dsSuccess):
    case getType(deleteWalletRequest):
    case getType(deleteWalletSuccess):
    case getType(setFavouriteWalletRequest):
    case getType(setFavouriteWalletSuccess):
    case getType(fetchTransactionsRequest):
    // payment
    case getType(paymentInitializeState):
    case getType(paymentAttiva.success):
    case getType(paymentIdPolling.request):
    case getType(paymentIdPolling.success):
    case getType(paymentCheck.request):
    case getType(paymentCheck.success):
    case getType(paymentFetchPspsForPaymentId.request):
    case getType(paymentFetchPspsForPaymentId.success):

    case getType(paymentUpdateWalletPsp.request):
    case getType(paymentUpdateWalletPsp.success):
    case getType(paymentExecutePayment.request):
    case getType(paymentExecutePayment.success):
    case getType(paymentCompletedFailure):
    case getType(paymentDeletePayment.request):
    case getType(paymentDeletePayment.success):

    //  profile First time Login
    case getType(profileFirstLogin):
    // other
    case getType(updateNotificationsInstallationToken):
    // bonus vacanze
    case getType(loadAllBonusActivations.request):
    case getType(loadAllBonusActivations.success):
    case getType(loadAvailableBonuses.success):
    case getType(loadAvailableBonuses.request):
    case getType(checkBonusVacanzeEligibility.request):
    case getType(activateBonusVacanze.request):
    case getType(cancelBonusVacanzeRequest):
    case getType(completeBonusVacanzeActivation):
    case getType(loadBonusVacanzeFromId.request):
      return mp.track(action.type);

    // bonus vacanze
    case getType(checkBonusVacanzeEligibility.success):
      const dsuPayload = EligibilityCheckSuccessEligible.is(
        action.payload.check
      )
        ? {
            id: action.payload.check.id,
            max_amount: action.payload.check.dsu_request.max_amount,
            max_tax_benefit: action.payload.check.dsu_request.max_tax_benefit,
            has_discrepancies:
              action.payload.check.dsu_request.has_discrepancies,
            dsu_created_at: action.payload.check.dsu_request.dsu_created_at,
            family_members_count:
              action.payload.check.dsu_request.family_members.length
          }
        : {};

      return mp.track(action.type, {
        status: action.payload.status,
        ...dsuPayload
      });
    case getType(storeEligibilityRequestId):
      return mp.track(action.type, {
        id: action.payload.id
      });
    case getType(activateBonusVacanze.success):
      const bonus = action.payload.activation
        ? getAnalyticsBonusRepresentation(action.payload.activation)
        : {};

      return mp.track(action.type, {
        status: action.payload.status,
        ...bonus
      });
    case getType(loadBonusVacanzeFromId.success):
      return mp.track(action.type, {
        ...getAnalyticsBonusRepresentation(action.payload)
      });
  }
  return Promise.resolve();
};

const getAnalyticsBonusRepresentation = (bonus: BonusActivationWithQrCode) => ({
  bonus_status: bonus.status,
  created_at: format(bonus.created_at),
  redeemed_at: bonus.redeemed_at ? format(bonus.redeemed_at) : "-"
});

/*
 * The middleware acts as a general hook in order to track any meaningful action
 */
export const actionTracking = (_: MiddlewareAPI) => (next: Dispatch) => (
  action: Action
): Action => {
  if (mixpanel !== undefined) {
    // call mixpanel tracking only after we have initialized mixpanel with the
    // API token
    trackAction(mixpanel)(action).then(constNull, constNull);
  }
  return next(action);
};

/*
  The middleware acts as a general hook in order to track any meaningful navigation action
  https://reactnavigation.org/docs/guides/screen-tracking#Screen-tracking-with-Redux
*/
export function screenTracking(
  store: MiddlewareAPI
): (_: Dispatch) => (__: Action) => Action {
  return (next: Dispatch): ((_: Action) => Action) => {
    return (action: Action): Action => {
      if (
        action.type !== NavigationActions.NAVIGATE &&
        action.type !== NavigationActions.BACK
      ) {
        return next(action);
      }
      const currentScreen = getCurrentRouteName(store.getState().nav);
      const result = next(action);
      const nextScreen = getCurrentRouteName(store.getState().nav);
      if (nextScreen !== currentScreen && mixpanel) {
        if (nextScreen) {
          setInstabugUserAttribute("activeScreen", nextScreen);
        }
        mixpanel
          .track("SCREEN_CHANGE", {
            SCREEN_NAME: nextScreen
          })
          .then(() => 0, () => 0);
      }
      return result;
    };
  };
}

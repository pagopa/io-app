import { constNull } from "fp-ts/lib/function";
import { sha256 } from "react-native-sha256";
import { NavigationActions } from "react-navigation";
import { getType } from "typesafe-actions";

import { mixpanel } from "../../mixpanel";

import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted,
  analyticsOnboardingStarted
} from "../actions/analytics";
import { applicationChangeState } from "../actions/application";
import {
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
  contentServiceLoadFailure,
  contentServiceLoadSuccess
} from "../actions/content";
import {
  identificationCancel,
  identificationFailure,
  identificationPinReset,
  identificationRequest,
  identificationStart,
  identificationSuccess
} from "../actions/identification";
import {
  loadMessageFailure,
  loadMessagesCancel,
  loadMessagesRequest,
  loadMessagesSuccess,
  loadMessageSuccess,
  setMessageReadState
} from "../actions/messages";
import {
  updateNotificationInstallationFailure,
  updateNotificationsInstallationToken
} from "../actions/notifications";
import { tosAcceptSuccess } from "../actions/onboarding";
import { createPinFailure, createPinSuccess } from "../actions/pinset";
import {
  profileLoadFailure,
  profileLoadSuccess,
  profileUpsertFailure,
  profileUpsertSuccess
} from "../actions/profile";
import {
  loadServiceFailure,
  loadServiceRequest,
  loadServiceSuccess,
  loadVisibleServicesFailure,
  loadVisibleServicesRequest,
  loadVisibleServicesSuccess
} from "../actions/services";
import { Action, Dispatch, MiddlewareAPI } from "../actions/types";
import {
  paymentAttivaFailure,
  paymentAttivaRequest,
  paymentAttivaSuccess,
  paymentCheckFailure,
  paymentCheckRequest,
  paymentCheckSuccess,
  paymentDeletePaymentFailure,
  paymentDeletePaymentRequest,
  paymentDeletePaymentSuccess,
  paymentExecutePaymentFailure,
  paymentExecutePaymentRequest,
  paymentExecutePaymentSuccess,
  paymentFetchPspsForPaymentIdFailure,
  paymentFetchPspsForPaymentIdRequest,
  paymentFetchPspsForPaymentIdSuccess,
  paymentIdPollingFailure,
  paymentIdPollingRequest,
  paymentIdPollingSuccess,
  paymentInitializeState,
  paymentUpdateWalletPspFailure,
  paymentUpdateWalletPspRequest,
  paymentUpdateWalletPspSuccess,
  paymentVerificaFailure,
  paymentVerificaRequest,
  paymentVerificaSuccess
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

// tslint:disable-next-line:cognitive-complexity
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

    //
    // Content actions (with properties)
    //

    case getType(contentServiceLoadFailure):
      return mp.track(action.type, {
        serviceId: action.payload
      });

    //
    // Wallet actions (with properties)
    //

    case getType(fetchWalletsSuccess):
    case getType(fetchTransactionsSuccess):
      return mp.track(action.type, {
        count: action.payload.length
      });

    //
    // Payment actions (with properties)
    //

    case getType(paymentVerificaRequest):
      return mp.track(action.type, {
        organizationFiscalCode: action.payload.organizationFiscalCode,
        paymentNoticeNumber: action.payload.paymentNoticeNumber
      });

    case getType(paymentVerificaSuccess):
      return mp.track(action.type, {
        amount: action.payload.importoSingoloVersamento
      });

    case getType(paymentAttivaRequest):
      return mp.track(action.type, {
        organizationFiscalCode: action.payload.rptId.organizationFiscalCode,
        paymentNoticeNumber: action.payload.rptId.paymentNoticeNumber
      });

    case getType(paymentExecutePaymentSuccess):
      return mp
        .track(action.type, {
          amount: action.payload.amount.amount
        })
        .then(_ => mp.trackCharge(action.payload.amount.amount));

    //
    // Wallet / payment failure actions (reason in the payload)
    //

    case getType(addWalletCreditCardFailure):
    case getType(paymentAttivaFailure):
    case getType(paymentVerificaFailure):
    case getType(paymentIdPollingFailure):
    case getType(paymentCheckFailure):
      return mp.track(action.type, {
        reason: action.payload
      });

    //
    // Actions (without properties)
    //

    // authentication
    case getType(analyticsAuthenticationStarted):
    case getType(analyticsAuthenticationCompleted):
    case getType(loginSuccess):
    case getType(loginFailure):
    case getType(sessionInformationLoadSuccess):
    case getType(sessionInformationLoadFailure):
    case getType(sessionExpired):
    case getType(sessionInvalid):
    case getType(logoutSuccess):
    case getType(logoutFailure):
    // identification
    case getType(identificationRequest):
    case getType(identificationStart):
    case getType(identificationCancel):
    case getType(identificationSuccess):
    case getType(identificationFailure):
    case getType(identificationPinReset):
    // onboarding
    case getType(analyticsOnboardingStarted):
    case getType(tosAcceptSuccess):
    case getType(createPinSuccess):
    case getType(createPinFailure):
    // profile
    case getType(profileLoadFailure):
    case getType(profileUpsertSuccess):
    case getType(profileUpsertFailure):
    // messages
    case getType(loadMessagesRequest):
    case getType(loadMessagesSuccess):
    case getType(loadMessagesCancel):
    case getType(loadMessageSuccess):
    case getType(loadMessageFailure):
    case getType(setMessageReadState):
    // services
    case getType(loadVisibleServicesRequest):
    case getType(loadVisibleServicesSuccess):
    case getType(loadVisibleServicesFailure):
    case getType(loadServiceRequest):
    case getType(loadServiceSuccess):
    case getType(loadServiceFailure):
    // content
    case getType(contentServiceLoadSuccess):
    // wallet
    case getType(fetchWalletsRequest):
    case getType(fetchWalletsFailure):
    case getType(addWalletCreditCardInit):
    case getType(addWalletCreditCardRequest):
    case getType(payCreditCardVerificationRequest):
    case getType(payCreditCardVerificationSuccess):
    case getType(payCreditCardVerificationFailure):
    case getType(creditCardCheckout3dsRequest):
    case getType(creditCardCheckout3dsSuccess):
    case getType(deleteWalletRequest):
    case getType(deleteWalletSuccess):
    case getType(deleteWalletFailure):
    case getType(setFavouriteWalletRequest):
    case getType(setFavouriteWalletSuccess):
    case getType(setFavouriteWalletFailure):
    case getType(fetchTransactionsRequest):
    case getType(fetchTransactionsFailure):
    // payment
    case getType(paymentInitializeState):
    case getType(paymentAttivaSuccess):
    case getType(paymentIdPollingRequest):
    case getType(paymentIdPollingSuccess):
    case getType(paymentCheckRequest):
    case getType(paymentCheckSuccess):
    case getType(paymentFetchPspsForPaymentIdRequest):
    case getType(paymentFetchPspsForPaymentIdSuccess):
    case getType(paymentFetchPspsForPaymentIdFailure):
    case getType(paymentUpdateWalletPspRequest):
    case getType(paymentUpdateWalletPspSuccess):
    case getType(paymentUpdateWalletPspFailure):
    case getType(paymentExecutePaymentRequest):
    case getType(paymentExecutePaymentFailure):
    case getType(paymentDeletePaymentRequest):
    case getType(paymentDeletePaymentSuccess):
    case getType(paymentDeletePaymentFailure):
    // other
    case getType(updateNotificationsInstallationToken):
    case getType(updateNotificationInstallationFailure):
      return mp.track(action.type);
  }
  return Promise.resolve();
};
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

// gets the current screen from navigation state
// TODO: Need to be fixed
export function getCurrentRouteName(navNode: any): string | undefined {
  if (!navNode) {
    return undefined;
  }

  if (
    navNode.index === undefined &&
    navNode.routeName &&
    typeof navNode.routeName === "string"
  ) {
    // navNode is a NavigationLeafRoute
    return navNode.routeName;
  }

  if (
    navNode.routes &&
    navNode.index !== undefined &&
    navNode.routes[navNode.index]
  ) {
    const route = navNode.routes[navNode.index];
    return getCurrentRouteName(route);
  }

  return undefined;
}

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

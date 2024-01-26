/* eslint-disable */

/**
 * A saga that manages the Wallet.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { DeferredPromise } from "@pagopa/ts-commons/lib/promises";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { CommonActions } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  call,
  delay,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import { TypeEnum } from "../../definitions/pagopa/Wallet";
import { BackendClient } from "../api/backend";
import { ContentClient } from "../api/content";
import { PaymentManagerClient } from "../api/pagopa";
import {
  apiUrlPrefix,
  fetchPagoPaTimeout,
  fetchPaymentManagerLongTimeout
} from "../config";
import {
  handleAddPan,
  handleLoadAbi,
  handleLoadPans
} from "../features/wallet/onboarding/bancomat/saga/networking";
import {
  addBancomatToWallet,
  loadAbi,
  searchUserPans
} from "../features/wallet/onboarding/bancomat/store/actions";
import {
  handleAddpayToWallet,
  handleSearchUserBPay
} from "../features/wallet/onboarding/bancomatPay/saga/networking";
import { addBPayToWalletAndActivateBpd } from "../features/wallet/onboarding/bancomatPay/saga/orchestration/addBPayToWallet";
import {
  addBPayToWallet,
  searchUserBPay,
  walletAddBPayStart
} from "../features/wallet/onboarding/bancomatPay/store/actions";
import {
  handleAddCoBadgeToWallet,
  handleLoadCoBadgeConfiguration,
  handleSearchUserCoBadge
} from "../features/wallet/onboarding/cobadge/saga/networking";
import { addCoBadgeToWalletAndActivateBpd } from "../features/wallet/onboarding/cobadge/saga/orchestration/addCoBadgeToWallet";
import {
  addCoBadgeToWallet,
  loadCoBadgeAbiConfiguration,
  searchUserCoBadge,
  walletAddCoBadgeStart
} from "../features/wallet/onboarding/cobadge/store/actions";
import { watchPaypalOnboardingSaga } from "../features/wallet/onboarding/paypal/saga";
import NavigationService from "../navigation/NavigationService";
import { navigateToWalletHome } from "../store/actions/navigation";
import { profileLoadSuccess, profileUpsert } from "../store/actions/profile";
import { deleteAllPaymentMethodsByFunction } from "../store/actions/wallet/delete";
import {
  addCreditCardOutcomeCode,
  paymentOutcomeCode
} from "../store/actions/wallet/outcomeCode";
import {
  abortRunningPayment,
  backToEntrypointPayment,
  paymentAttiva,
  paymentCheck,
  paymentCompletedSuccess,
  paymentDeletePayment,
  paymentExecuteStart,
  paymentIdPolling,
  paymentInitializeEntrypointRoute,
  paymentInitializeState,
  paymentUpdateWalletPsp,
  paymentVerifica,
  pspForPaymentV2,
  pspForPaymentV2WithCallbacks,
  runDeleteActivePaymentSaga,
  runStartOrResumePaymentActivationSaga
} from "../store/actions/wallet/payment";
import {
  fetchPsp,
  fetchTransactionRequest,
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsRequestWithExpBackoff
} from "../store/actions/wallet/transactions";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  addWalletCreditCardWithBackoffRetryRequest,
  addWalletNewCreditCardFailure,
  addWalletNewCreditCardSuccess,
  deleteWalletRequest,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsRequestWithExpBackoff,
  fetchWalletsSuccess,
  refreshPMTokenWhileAddCreditCard,
  runSendAddCobadgeTrackSaga,
  runStartOrResumeAddCreditCardSaga,
  setFavouriteWalletRequest,
  setWalletSessionEnabled,
  updatePaymentStatus
} from "../store/actions/wallet/wallets";

import { isProfileEmailValidatedSelector } from "../store/reducers/profile";
import { GlobalState } from "../store/reducers/types";
import { lastPaymentOutcomeCodeSelector } from "../store/reducers/wallet/outcomeCode";
import { paymentIdSelector } from "../store/reducers/wallet/payment";
import { getAllWallets } from "../store/reducers/wallet/wallets";
import { SessionToken } from "../types/SessionToken";
import { NullableWallet, PaymentManagerToken } from "../types/pagopa";
import { ReduxSagaEffect } from "../types/utils";
import { SessionManager } from "../utils/SessionManager";
import { waitBackoffError } from "../utils/backoffError";
import { isTestEnv } from "../utils/environment";
import { convertUnknownToError } from "../utils/errors";
import { defaultRetryingFetch } from "../utils/fetch";
import { newLookUpId, resetLookUpId } from "../utils/pmLookUpId";
import { paymentsDeleteUncompletedSaga } from "./payments";
import { sendAddCobadgeMessageSaga } from "./wallet/cobadgeReminder";
import {
  addWalletCreditCardRequestHandler,
  deleteAllPaymentMethodsByFunctionRequestHandler,
  deleteWalletRequestHandler,
  fetchPspRequestHandler,
  fetchTransactionRequestHandler,
  fetchTransactionsRequestHandler,
  getPspV2,
  getPspV2WithCallbacks,
  getWallets,
  paymentAttivaRequestHandler,
  paymentCheckRequestHandler,
  paymentDeletePaymentRequestHandler,
  paymentIdPollingRequestHandler,
  paymentStartRequest,
  paymentVerificaRequestHandler,
  setFavouriteWalletRequestHandler,
  updatePaymentStatusSaga,
  updateWalletPspRequestHandler
} from "./wallet/pagopaApis";

const successScreenDelay = 2000 as Millisecond;

/**
 * This saga manages the flow for adding a new card.
 *
 * Adding a new card can happen either from the wallet home screen or during the
 * payment process from the payment method selection screen.
 *
 * To board a new card, we must complete the following steps:
 *
 * 1) add the card to the user wallets
 * 2) complete the 3DS checkout for a fake payment
 *
 * This saga updates a state for each step, thus it can be run multiple times
 * to resume the flow from the last successful step (retry behavior).
 *
 * This saga gets run from ConfirmCardDetailsScreen that is also responsible
 * for showing relevant error and loading states to the user based on the
 * potential state of the flow substates (see GlobalState.wallet.wallets).
 *
 */
function* startOrResumeAddCreditCardSaga(
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof runStartOrResumeAddCreditCardSaga>
) {
  // prepare a new wallet (payment method) that describes the credit card we
  // want to add
  const creditCardWallet: NullableWallet = {
    idWallet: undefined,
    type: TypeEnum.CREDIT_CARD,
    favourite: action.payload.setAsFavorite,
    creditCard: action.payload.creditCard,
    psp: undefined
  };
  newLookUpId();
  while (true) {
    // before each step we select the updated payment state to know what has
    // been already done.
    const state: ReturnType<typeof getAllWallets> = yield* select(
      getAllWallets
    );
    //
    // First step: add the credit card to the user wallets
    //
    // Note that the new wallet will not be visibile to the user until all the
    // card onboarding steps have been completed.
    //
    if (pot.isNone(state.creditCardAddWallet)) {
      yield* put(
        addWalletCreditCardWithBackoffRetryRequest({
          creditcard: creditCardWallet
        })
      );
      const responseAction = yield* take<
        ActionType<
          typeof addWalletCreditCardSuccess | typeof addWalletCreditCardFailure
        >
      >([addWalletCreditCardSuccess, addWalletCreditCardFailure]);
      if (isActionOf(addWalletCreditCardFailure, responseAction)) {
        // this step failed, exit the flow
        if (
          responseAction.payload.kind === "ALREADY_EXISTS" &&
          action.payload.onFailure
        ) {
          // if the card already exists, run onFailure before exiting the flow
          action.payload.onFailure(responseAction.payload.kind);
        }
        break;
      }
      // all is ok, continue to the next step
      continue;
    }

    const { idWallet } = state.creditCardAddWallet.value.data;

    function* dispatchAddNewCreditCardFailure() {
      yield* put(addWalletNewCreditCardFailure());
      if (action.payload.onFailure) {
        action.payload.onFailure();
      }
    }

    function* waitAndNavigateToWalletHome() {
      // Add a delay to allow the user to see the thank you page
      yield* delay(successScreenDelay);
      yield* call(navigateToWalletHome);
    }

    /**
     * Second step: process the 3ds checkout:
     * 1. Request a new token to the PM
     * 2. Check the new token response:
     *    - If the token is returned successfully request all the wallets (to check if the temporary one is present in the wallet list)
     *    - else dispatch a failure action and call the onFailure function
     * 3. Wait until the addCreditCardOutcomeCode action is dispatched -> the user exit from the webview
     * 4. Check if lastPaymentOutcomeCodeSelector is some or none:
     *    - The value will be always some since we are waiting the dispatch of the addCreditCardOutcomeCode action
     * 5. Check if lastPaymentOutcomeCodeSelector.status is success:
     *    - If success show the thank you page for 2 seconds and starts the bpd onboarding
     *    - If not success dispatch a failure action and show the ko page (the show of the ko page is
     *      managed inside the PayWebViewModal component)
     *  */
    try {
      // change the store to loading just before ask for a new token
      yield* put(refreshPMTokenWhileAddCreditCard.request({ idWallet }));
      // Request a new token to the PM. This prevent expired token during the webview navigation.
      // If the request for the new token fails a new Error is caught, the step fails and we exit the flow.
      const pagoPaToken: O.Option<PaymentManagerToken> = yield* call(
        pmSessionManager.getNewToken
      );
      if (O.isSome(pagoPaToken)) {
        // store the pm session token
        yield* put(refreshPMTokenWhileAddCreditCard.success(pagoPaToken.value));
        // Wait until the outcome code from the webview is available
        yield* take(addCreditCardOutcomeCode);

        const maybeOutcomeCode: ReturnType<
          typeof lastPaymentOutcomeCodeSelector
        > = yield* select(lastPaymentOutcomeCodeSelector);
        // Since we wait the dispatch of the addCreditCardOutcomeCode action,
        // the else case can't happen, because the action in every case set a some value in the store.
        if (O.isSome(maybeOutcomeCode.outcomeCode)) {
          const outcomeCode = maybeOutcomeCode.outcomeCode.value;

          // The credit card was added successfully
          if (outcomeCode.status === "success") {
            yield* put(addWalletNewCreditCardSuccess());

            // Get all the wallets
            yield* put(fetchWalletsRequest());
            const fetchWalletsResultAction = yield* take<
              ActionType<
                typeof fetchWalletsSuccess | typeof fetchWalletsFailure
              >
            >([fetchWalletsSuccess, fetchWalletsFailure]);
            if (isActionOf(fetchWalletsSuccess, fetchWalletsResultAction)) {
              const updatedWallets = fetchWalletsResultAction.payload;
              const maybeAddedWallet = updatedWallets.find(
                _ => _.idWallet === idWallet
              );

              if (maybeAddedWallet !== undefined) {
                // Add a delay to allow the user to see the thank you page
                yield* delay(successScreenDelay);
                // signal the completion
                if (action.payload.onSuccess) {
                  action.payload.onSuccess(maybeAddedWallet);
                }
              } else {
                // cant find wallet in wallet list
                yield* call(waitAndNavigateToWalletHome);
              }
            } else {
              // cant load wallets but credit card is added successfully
              yield* call(waitAndNavigateToWalletHome);
              break;
            }
          } else {
            // outcome is different from success
            yield* call(dispatchAddNewCreditCardFailure);
          }
        } else {
          // the outcome is none
          yield* call(dispatchAddNewCreditCardFailure);
        }
      } else {
        yield* put(
          refreshPMTokenWhileAddCreditCard.failure(
            new Error("cant load pm session token")
          )
        );
        // Cannot refresh wallet token
        yield* call(dispatchAddNewCreditCardFailure);
        break;
      }
    } catch (e) {
      if (action.payload.onFailure) {
        action.payload.onFailure(
          // This cast should be safe enough conceptually.
          convertUnknownToError(e).message as "ALREADY_EXISTS" | undefined
        );
      }
    }
    break;
  }
  resetLookUpId();
}

/**
 * This saga will run in sequence the requests needed to activate a payment:
 *
 * 1) attiva -> nodo
 * 2) polling for a payment id <- nodo
 * 3) check -> payment manager
 *
 * Each step has a corresponding state in the wallet.payment state that gets
 * updated with the "pot" state (none -> loading -> some|error).
 *
 * Each time the saga is run, it will resume from the next step that needs to
 * be executed (either because it never executed or because it previously
 * returned an error).
 *
 * Not that the pagoPA activation flow is not really resumable in case a step
 * returns an error (i.e. the steps are not idempotent).
 *
 * TODO: the resume logic may be made more intelligent by analyzing the error
 *       of each step and proceeed to the next step under certain conditions
 *       (e.g. when resuming a previous payment flow from scratch, some steps
 *       may fail because they are not idempotent, but we could just proceed
 *       to the next step).
 */
// eslint-disable-next-line
function* startOrResumePaymentActivationSaga(
  action: ActionType<typeof runStartOrResumePaymentActivationSaga>
) {
  while (true) {
    // before each step we select the updated payment state to know what has
    // been already done.
    const paymentState: GlobalState["wallet"]["payment"] = yield* select(
      _ => _.wallet.payment
    );

    // first step: Attiva
    if (pot.isNone(paymentState.attiva)) {
      // this step needs to be executed
      yield* put(
        paymentAttiva.request({
          rptId: action.payload.rptId,
          verifica: action.payload.verifica
        })
      );
      const responseAction = yield* take<
        ActionType<typeof paymentAttiva.success | typeof paymentAttiva.failure>
      >([paymentAttiva.success, paymentAttiva.failure]);
      if (isActionOf(paymentAttiva.failure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    // second step: poll for payment ID
    if (pot.isNone(paymentState.paymentId)) {
      // this step needs to be executed
      yield* put(paymentIdPolling.request(action.payload.verifica));
      const responseAction = yield* take<
        ActionType<
          typeof paymentIdPolling.success | typeof paymentIdPolling.failure
        >
      >([paymentIdPolling.success, paymentIdPolling.failure]);
      if (isActionOf(paymentIdPolling.failure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    // third step: "check" the payment
    if (pot.isNone(paymentState.check)) {
      // this step needs to be executed
      yield* put(paymentCheck.request(paymentState.paymentId.value));
      const responseAction = yield* take<
        ActionType<typeof paymentCheck.success | typeof paymentCheck.failure>
      >([paymentCheck.success, paymentCheck.failure]);
      if (isActionOf(paymentCheck.failure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    // finally, we signal the success of the activation flow
    action.payload.onSuccess(paymentState.paymentId.value);

    // since this is the last step, we exit the flow
    break;
  }
}

/**
 * This saga attempts to delete the active payment, if there's one.
 *
 * This is a best effort operation as the result is actually ignored.
 */
function* deleteActivePaymentSaga() {
  const potPaymentId: ReturnType<typeof paymentIdSelector> = yield* select(
    paymentIdSelector
  );
  const maybePaymentId = pot.toOption(potPaymentId);
  // stop polling
  shouldAbortPaymentIdPollingRequest.e2(true);
  if (O.isSome(maybePaymentId)) {
    yield* put(
      paymentDeletePayment.request({ paymentId: maybePaymentId.value })
    );
  }
}

/**
 * this saga checks the outcome codes coming from a payment or from the payment-check done during the credit card onboarding
 * if the outcome exits and it is different from "success" it tries to delete the payment activation
 */
function* deleteUnsuccessfulActivePaymentSaga() {
  // it can be related to a payment or a payment check done during the credit card onboarding
  const lastPaymentOutCome = yield* select(lastPaymentOutcomeCodeSelector);
  if (
    pipe(
      lastPaymentOutCome.outcomeCode,
      O.exists(({ status }) => status !== "success")
    )
  ) {
    /**
     * run the procedure to delete the payment activation
     * even if there is no one running (that check is done by the relative saga)
     */
    yield* put(runDeleteActivePaymentSaga());
  }
}

/**
 * this saga delete a payment just before the user pays
 * it should be invoked from the payment UX
 */
function* abortRunningPaymentSaga() {
  // delete the active payment from pagoPA
  yield* put(runDeleteActivePaymentSaga());
  // navigate to entrypoint of payment or wallet home
  yield* put(backToEntrypointPayment());
}

// this is a shared DeferredPromise used to stop polling when user aborts a running payment
// eslint-disable-next-line
let shouldAbortPaymentIdPollingRequest = DeferredPromise<boolean>();
/**
 * Main wallet saga.
 *
 * This saga is responsible for handling actions the mostly correspond to API
 * requests towards the pagoPA "nodo" and the pagoPA "PaymentManager" APIs.
 *
 * This saga gets forked from the startup saga each time the user authenticates
 * and a new PagopaToken gets received from the backend. Infact, the
 * pagoPaClient passed as paramenter to this saga, embeds the PagopaToken.
 */
// eslint-disable-next-line
export function* watchWalletSaga(
  sessionToken: SessionToken,
  walletToken: string,
  paymentManagerUrlPrefix: string
): Generator<ReduxSagaEffect, void, boolean> {
  // Builds a backend client specifically for the pagopa-proxy endpoints that
  // need a fetch instance that doesn't retry requests and have longer timeout
  const pagopaNodoClient = BackendClient(
    apiUrlPrefix,
    sessionToken,
    {},
    defaultRetryingFetch(fetchPagoPaTimeout, 0)
  );

  // Backend client for polling for paymentId - uses an instance of fetch that
  // considers a 404 as a transient error and retries with a constant delay
  const pollingPagopaNodoClient = BackendClient(apiUrlPrefix, sessionToken);

  // Client for the PagoPA PaymentManager
  const paymentManagerClient: PaymentManagerClient = PaymentManagerClient(
    paymentManagerUrlPrefix,
    walletToken,
    // despite both fetch have same configuration, keeping both ensures possible modding
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0),
    defaultRetryingFetch(fetchPaymentManagerLongTimeout, 0)
  );

  // Helper function that requests a new session token from the PaymentManager.
  // When calling the PM APIs, we must use separate session, generated from the
  // walletToken.
  const getPaymentManagerSession = async () => {
    try {
      const response = await paymentManagerClient.getSession(walletToken);
      if (E.isRight(response) && response.right.status === 200) {
        return O.some(response.right.value.data.sessionToken);
      }
      return O.none;
    } catch {
      return O.none;
    }
  };

  // The session manager for the PagoPA PaymentManager (PM) will manage the
  // refreshing of the PM session when calling its APIs, keeping a shared token
  // and serializing the refresh requests.
  const pmSessionManager = new SessionManager(getPaymentManagerSession);
  // check if the current profile (this saga starts only when the user is logged in)
  // has an email address validated
  const isEmailValidated = yield* select(isProfileEmailValidatedSelector);
  yield* call(pmSessionManager.setSessionEnabled, isEmailValidated);
  //
  // Sagas
  //

  yield* takeLatest(
    getType(runStartOrResumeAddCreditCardSaga),
    startOrResumeAddCreditCardSaga,
    pmSessionManager
  );

  yield* takeLatest(
    getType(runStartOrResumePaymentActivationSaga),
    startOrResumePaymentActivationSaga
  );

  yield* takeLatest(
    getType(runDeleteActivePaymentSaga),
    deleteActivePaymentSaga
  );

  yield* takeLatest(
    [paymentOutcomeCode, addCreditCardOutcomeCode],
    deleteUnsuccessfulActivePaymentSaga
  );

  //
  yield* takeLatest(getType(abortRunningPayment), abortRunningPaymentSaga);

  //
  // API requests
  //

  yield* takeLatest(
    getType(fetchTransactionsRequest),
    fetchTransactionsRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(fetchTransactionsRequestWithExpBackoff),
    function* (
      action: ActionType<typeof fetchTransactionsRequestWithExpBackoff>
    ) {
      yield* call(waitBackoffError, fetchTransactionsFailure);
      yield* put(fetchTransactionsRequest(action.payload));
    }
  );

  yield* takeLatest(
    getType(fetchTransactionRequest),
    fetchTransactionRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(getType(fetchWalletsRequestWithExpBackoff), function* () {
    yield* call(waitBackoffError, fetchWalletsFailure);
    yield* put(fetchWalletsRequest());
  });

  yield* takeLatest(
    getType(fetchWalletsRequest),
    getWallets,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(addWalletCreditCardRequest),
    addWalletCreditCardRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(addWalletCreditCardWithBackoffRetryRequest),
    function* (
      action: ActionType<typeof addWalletCreditCardWithBackoffRetryRequest>
    ) {
      yield* call(waitBackoffError, addWalletCreditCardFailure);
      yield* put(addWalletCreditCardRequest(action.payload));
    }
  );

  yield* takeLatest(
    getType(setFavouriteWalletRequest),
    setFavouriteWalletRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(paymentUpdateWalletPsp.request),
    updateWalletPspRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(deleteAllPaymentMethodsByFunction.request),
    deleteAllPaymentMethodsByFunctionRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(deleteWalletRequest),
    deleteWalletRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(paymentVerifica.request),
    paymentVerificaRequestHandler,
    pagopaNodoClient.getVerificaRpt
  );

  yield* takeLatest(
    getType(paymentAttiva.request),
    paymentAttivaRequestHandler,
    pagopaNodoClient.postAttivaRpt
  );

  yield* takeLatest(
    getType(paymentIdPolling.request),
    function* (action: ActionType<(typeof paymentIdPolling)["request"]>) {
      // getPaymentId is a tuple2
      // e1: deferredPromise, used to abort the constantPollingFetch
      // e2: the fetch to execute
      const getPaymentId = pollingPagopaNodoClient.getPaymentId();
      shouldAbortPaymentIdPollingRequest = getPaymentId.e1;
      yield* call(paymentIdPollingRequestHandler, getPaymentId, action);
    }
  );

  yield* takeLatest(
    getType(paymentCheck.request),
    paymentCheckRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(paymentExecuteStart.request),
    paymentStartRequest,
    pmSessionManager
  );

  yield* takeLatest(
    getType(paymentDeletePayment.request),
    paymentDeletePaymentRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(fetchPsp.request),
    fetchPspRequestHandler,
    paymentManagerClient,
    pmSessionManager
  );

  /**
   * whenever the profile is loaded (from a load request or from un update)
   * check if the email is validated. If it not the session manager has to be disabled
   */
  yield* takeLatest(
    [getType(profileUpsert.success), getType(profileLoadSuccess)],
    checkProfile
  );

  yield* takeLatest(
    getType(setWalletSessionEnabled),
    setWalletSessionEnabledSaga,
    pmSessionManager
  );

  yield* takeLatest(
    getType(updatePaymentStatus.request),
    updatePaymentStatusSaga,
    paymentManagerClient,
    pmSessionManager
  );

  yield* takeLatest(
    getType(pspForPaymentV2.request),
    getPspV2,
    paymentManagerClient.getPspV2,
    pmSessionManager
  );

  yield* takeLatest(
    getType(pspForPaymentV2WithCallbacks),
    getPspV2WithCallbacks
  );

  // here it used to check for BPD enabled
  const contentClient = ContentClient();

  // watch for load abi request
  yield* takeLatest(loadAbi.request, handleLoadAbi, contentClient.getAbiList);

  // watch for load pans request
  yield* takeLatest(
    searchUserPans.request,
    handleLoadPans,
    paymentManagerClient.getPans,
    pmSessionManager
  );

  // watch for add pan request
  yield* takeLatest(
    addBancomatToWallet.request,
    handleAddPan,
    paymentManagerClient.addPans,
    pmSessionManager
  );

  // watch for add BPay to Wallet workflow
  yield* takeLatest(walletAddBPayStart, addBPayToWalletAndActivateBpd);

  // watch for BancomatPay search request
  yield* takeLatest(
    searchUserBPay.request,
    handleSearchUserBPay,
    paymentManagerClient.searchBPay,
    pmSessionManager
  );
  // watch for add BancomatPay to the user's wallet
  yield* takeLatest(
    addBPayToWallet.request,
    handleAddpayToWallet,
    paymentManagerClient.addBPayToWallet,
    pmSessionManager
  );

  // watch for CoBadge search request
  yield* takeLatest(
    searchUserCoBadge.request,
    handleSearchUserCoBadge,
    paymentManagerClient.getCobadgePans,
    paymentManagerClient.searchCobadgePans,
    pmSessionManager
  );
  // watch for add CoBadge to the user's wallet
  yield* takeLatest(
    addCoBadgeToWallet.request,
    handleAddCoBadgeToWallet,
    paymentManagerClient.addCobadgeToWallet,
    pmSessionManager
  );
  // watch for CoBadge configuration request
  yield* takeLatest(
    loadCoBadgeAbiConfiguration.request,
    handleLoadCoBadgeConfiguration,
    contentClient.getCobadgeServices
  );

  // watch for add co-badge to Wallet workflow
  yield* takeLatest(walletAddCoBadgeStart, addCoBadgeToWalletAndActivateBpd);

  yield* fork(
    watchPaypalOnboardingSaga,
    paymentManagerClient,
    pmSessionManager
  );
  // end of BPDEnabled check

  // Check if a user has a bancomat and has not requested a cobadge yet and send
  // the information to mixpanel
  yield* takeLatest(runSendAddCobadgeTrackSaga, sendAddCobadgeMessageSaga);
  yield* fork(paymentsDeleteUncompletedSaga);
}

function* checkProfile(
  action:
    | ActionType<typeof profileUpsert.success>
    | ActionType<typeof profileLoadSuccess>
) {
  const enabled =
    action.type === getType(profileUpsert.success)
      ? action.payload.newValue.is_email_validated === true
      : action.payload.is_email_validated === true;
  yield* put(setWalletSessionEnabled(enabled));
}

function* enableSessionManager(
  enable: boolean,
  sessionManager: SessionManager<PaymentManagerToken>
) {
  yield* call(sessionManager.setSessionEnabled, enable);
}

/**
 * enable the Session Manager to perform request with a fresh token
 * otherwise the Session Manager doesn't refresh the token and it doesn't
 * perform requests to payment manager
 * @param sessionManager
 * @param action
 */
function* setWalletSessionEnabledSaga(
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof setWalletSessionEnabled>
): Iterator<ReduxSagaEffect> {
  yield* call(enableSessionManager, action.payload, sessionManager);
}
/**
 * This saga checks what is the route whence a new payment is started
 */
export function* watchPaymentInitializeSaga(): Iterator<ReduxSagaEffect> {
  yield* takeEvery(getType(paymentInitializeState), function* () {
    const currentRouteName = NavigationService.getCurrentRouteName();
    const currentRouteKey = NavigationService.getCurrentRouteKey();
    if (currentRouteName !== undefined && currentRouteKey !== undefined) {
      yield* put(
        paymentInitializeEntrypointRoute({
          name: currentRouteName,
          key: currentRouteKey
        })
      );
    }
  });

  /**
   * create and destroy the PM lookUpID through the payment flow
   * more details https://www.pivotaltracker.com/story/show/177132354
   */
  yield* takeEvery(getType(paymentInitializeState), function* () {
    newLookUpId();
    yield* take<
      ActionType<
        typeof paymentCompletedSuccess | typeof runDeleteActivePaymentSaga
      >
    >([paymentCompletedSuccess, runDeleteActivePaymentSaga]);
    resetLookUpId();
  });
}

/**
 * This saga back to entrypoint payment if the payment was initiated from the message list or detail
 * otherwise if the payment starts in scan qr code screen or in Manual data insertion screen
 * it makes one or two supplementary step backs (the correspondant step to wallet home from these screens)
 */
export function* watchBackToEntrypointPaymentSaga(): Iterator<ReduxSagaEffect> {
  yield* takeEvery(getType(backToEntrypointPayment), function* () {
    const entrypointRoute: GlobalState["wallet"]["payment"]["entrypointRoute"] =
      yield* select(_ => _.wallet.payment.entrypointRoute);
    if (entrypointRoute !== undefined) {
      yield* call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(entrypointRoute.name, {
          key: entrypointRoute.key
        })
      );
      yield* put(paymentInitializeState());
    }
  });
}

// to keep solid code encapsulation
export const testableWalletsSaga = isTestEnv
  ? {
      startOrResumeAddCreditCardSaga,
      successScreenDelay,
      deleteUnsuccessfulActivePaymentSaga
    }
  : undefined;

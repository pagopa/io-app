import { RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import { call, Effect, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";

import { fromNullable } from "fp-ts/lib/Option";
import { BackendClient } from "../../api/backend";
import { PaymentManagerClient } from "../../api/pagopa";
import {
  paymentAttiva,
  paymentCheck,
  paymentDeletePayment,
  paymentExecutePayment,
  paymentFetchPspsForPaymentId,
  paymentIdPolling,
  paymentUpdateWalletPsp,
  paymentVerifica
} from "../../store/actions/wallet/payment";
import {
  fetchPsp,
  fetchTransactionFailure,
  fetchTransactionRequest,
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsSuccess,
  fetchTransactionSuccess
} from "../../store/actions/wallet/transactions";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  deleteWalletFailure,
  deleteWalletRequest,
  deleteWalletSuccess,
  fetchWalletsFailure,
  fetchWalletsSuccess,
  payCreditCardVerificationFailure,
  payCreditCardVerificationRequest,
  payCreditCardVerificationSuccess,
  setFavouriteWalletFailure,
  setFavouriteWalletRequest,
  setFavouriteWalletSuccess
} from "../../store/actions/wallet/wallets";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { PaymentManagerToken } from "../../types/pagopa";
import { SagaCallReturnType } from "../../types/utils";
import { readablePrivacyReport } from "../../utils/reporters";
import { SessionManager } from "../../utils/SessionManager";

//
// Payment Manager APIs
//

/**
 * Handles fetchWalletsRequest
 */

export function* fetchWalletsRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>
): Iterator<Effect> {
  const request = pmSessionManager.withRefresh(pagoPaClient.getWallets);
  try {
    const getResponse: SagaCallReturnType<typeof request> = yield call(request);
    if (getResponse.isRight()) {
      if (getResponse.value.status === 200) {
        yield put(fetchWalletsSuccess(getResponse.value.value.data));
      } else {
        throw Error(`response status ${getResponse.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(getResponse.value));
    }
  } catch (error) {
    yield put(fetchWalletsFailure(error));
  }
}

/**
 * Handles fetchTransactionsRequest
 */
export function* fetchTransactionsRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof fetchTransactionsRequest>
): Iterator<Effect> {
  const request = pmSessionManager.withRefresh(
    pagoPaClient.getTransactions(action.payload.start)
  );
  try {
    const response: SagaCallReturnType<typeof request> = yield call(request);
    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(
          fetchTransactionsSuccess({
            data: response.value.value.data,
            total: fromNullable(response.value.value.total)
          })
        );
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (error) {
    yield put(fetchTransactionsFailure(error));
  }
}

/**
 * Handles fetchTransactionRequest
 */
export function* fetchTransactionRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof fetchTransactionRequest>
): Iterator<Effect> {
  const request = pmSessionManager.withRefresh(
    pagoPaClient.getTransaction(action.payload)
  );
  try {
    const response: SagaCallReturnType<typeof request> = yield call(request);
    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(fetchTransactionSuccess(response.value.value.data));
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (error) {
    yield put(fetchTransactionFailure(error));
  }
}

/**
 * Handles fetchPspRequest
 */
export function* fetchPspRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof fetchPsp["request"]>
): Iterator<Effect> {
  const request = pmSessionManager.withRefresh(
    pagoPaClient.getPsp(action.payload.idPsp)
  );
  try {
    const response: SagaCallReturnType<typeof request> = yield call(request);

    if (response.isRight()) {
      if (response.value.status === 200) {
        const psp = response.value.value.data;
        const successAction = fetchPsp.success({
          idPsp: action.payload.idPsp,
          psp
        });
        yield put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (error) {
    const failureAction = fetchPsp.failure({
      idPsp: action.payload.idPsp,
      error
    });
    yield put(failureAction);
    if (action.payload.onFailure) {
      action.payload.onFailure(failureAction);
    }
  }
}

/**
 * Handles setFavouriteWalletRequest
 */
export function* setFavouriteWalletRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof setFavouriteWalletRequest>
): Iterator<Effect> {
  const favouriteWalletId = action.payload;
  if (favouriteWalletId === undefined) {
    // FIXME: currently there is no way to unset a favourite wallet
    return;
  }
  const setFavouriteWallet = pagoPaClient.favouriteWallet(favouriteWalletId);

  const request = pmSessionManager.withRefresh(setFavouriteWallet);
  try {
    const response: SagaCallReturnType<typeof request> = yield call(request);
    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(setFavouriteWalletSuccess(response.value.value.data));
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (error) {
    yield put(setFavouriteWalletFailure(error));
  }
}

/**
 * Updates a Wallet with a new favorite PSP
 *
 * TODO: consider avoiding the fetch, let the application logic decide
 */
// tslint:disable-next-line:cognitive-complexity
export function* updateWalletPspRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof paymentUpdateWalletPsp["request"]>
) {
  // First update the selected wallet (walletId) with the
  // new PSP (action.payload); then request a new list
  // of wallets (which will contain the updated PSP)
  const { wallet, idPsp } = action.payload;

  const apiUpdateWalletPsp = pagoPaClient.updateWalletPsp(wallet.idWallet, {
    data: { idPsp }
  });
  const updateWalletPspWithRefresh = pmSessionManager.withRefresh(
    apiUpdateWalletPsp
  );

  const getWalletsWithRefresh = pmSessionManager.withRefresh(
    pagoPaClient.getWallets
  );

  try {
    const response: SagaCallReturnType<
      typeof updateWalletPspWithRefresh
    > = yield call(updateWalletPspWithRefresh);

    if (response.isRight()) {
      if (response.value.status === 200) {
        const getResponse: SagaCallReturnType<
          typeof getWalletsWithRefresh
        > = yield call(getWalletsWithRefresh);
        if (getResponse.isRight()) {
          if (getResponse.value.status === 200) {
            // look for the updated wallet
            const updatedWallet = getResponse.value.value.data.find(
              _ => _.idWallet === wallet.idWallet
            );
            if (updatedWallet !== undefined) {
              // the wallet is still there, we can proceed
              const successAction = paymentUpdateWalletPsp.success({
                wallets: getResponse.value.value.data,
                updatedWallet: response.value.value.data
              });
              yield put(successAction);
              if (action.payload.onSuccess) {
                // signal the callee if requested
                action.payload.onSuccess(successAction);
              }
            }
          } else {
            // oops, the wallet is not there anymore!
            throw Error(`response status ${response.value.status}`);
          }
        } else {
          throw Error(readablePrivacyReport(getResponse.value));
        }
      } else {
        // oops, the wallet is not there anymore!
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (error) {
    const failureAction = paymentUpdateWalletPsp.failure(error.message);
    yield put(failureAction);
    if (action.payload.onFailure) {
      // signal the callee if requested
      action.payload.onFailure(failureAction);
    }
  }
}

/**
 * Handles deleteWalletRequest
 *
 * TODO: consider avoiding the fetch, let the appliction logic decide
 */
// tslint:disable-next-line: cognitive-complexity
export function* deleteWalletRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof deleteWalletRequest>
): Iterator<Effect> {
  const deleteWalletApi = pagoPaClient.deleteWallet(action.payload.walletId);
  const deleteWalletWithRefresh = pmSessionManager.withRefresh(deleteWalletApi);

  const getWalletsWithRefresh = pmSessionManager.withRefresh(
    pagoPaClient.getWallets
  );
  try {
    const deleteResponse: SagaCallReturnType<
      typeof deleteWalletWithRefresh
    > = yield call(deleteWalletWithRefresh);
    if (deleteResponse.isRight() && deleteResponse.value.status === 200) {
      const getResponse: SagaCallReturnType<
        typeof getWalletsWithRefresh
      > = yield call(getWalletsWithRefresh);
      if (getResponse.isRight() && getResponse.value.status === 200) {
        const successAction = deleteWalletSuccess(getResponse.value.value.data);
        yield put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
      } else {
        throw Error(
          getResponse.fold(
            readablePrivacyReport,
            ({ status }) => `response status ${status}`
          )
        );
      }
    } else {
      throw Error(
        deleteResponse.fold(
          readablePrivacyReport,
          ({ status }) => `response status ${status}`
        )
      );
    }
  } catch (e) {
    const failureAction = deleteWalletFailure(e);
    yield put(failureAction);
    if (action.payload.onFailure) {
      action.payload.onFailure(failureAction);
    }
  }
}

/**
 * Handles addWalletCreditCardRequest
 */
export function* addWalletCreditCardRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof addWalletCreditCardRequest>
) {
  const boardCreditCard = pagoPaClient.addWalletCreditCard(
    action.payload.creditcard
  );
  const boardCreditCardWithRefresh = pmSessionManager.withRefresh(
    boardCreditCard
  );

  try {
    const response: SagaCallReturnType<
      typeof boardCreditCardWithRefresh
    > = yield call(boardCreditCardWithRefresh);

    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(addWalletCreditCardSuccess(response.value.value));
      } else if (
        response.value.status === 422 &&
        response.value.value.message === "creditcard.already_exists"
      ) {
        yield put(addWalletCreditCardFailure("ALREADY_EXISTS"));
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (e) {
    yield put(addWalletCreditCardFailure(e.message));
  }
}

/**
 * Handles payCreditCardVerificationRequest
 */
export function* payCreditCardVerificationRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof payCreditCardVerificationRequest>
) {
  const boardPay = pagoPaClient.payCreditCardVerification(
    action.payload.payRequest,
    action.payload.language
  );
  const boardPayWithRefresh = pmSessionManager.withRefresh(boardPay);
  try {
    const response: SagaCallReturnType<typeof boardPayWithRefresh> = yield call(
      boardPayWithRefresh
    );

    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(payCreditCardVerificationSuccess(response.value.value));
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (e) {
    yield put(payCreditCardVerificationFailure(e));
  }
}

/**
 * Handles paymentFetchPspsForWalletRequest
 */
export function* paymentFetchPspsForWalletRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof paymentFetchPspsForPaymentId["request"]>
) {
  const apiGetPspList = pagoPaClient.getPspList(
    action.payload.idPayment,
    action.payload.idWallet
  );
  const getPspListWithRefresh = pmSessionManager.withRefresh(apiGetPspList);
  try {
    const response: SagaCallReturnType<
      typeof getPspListWithRefresh
    > = yield call(getPspListWithRefresh);
    if (response.isRight()) {
      if (response.value.status === 200) {
        const successAction = paymentFetchPspsForPaymentId.success(
          response.value.value.data
        );
        yield put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (e) {
    const failureAction = paymentFetchPspsForPaymentId.failure(e);
    yield put(failureAction);
    if (action.payload.onFailure) {
      action.payload.onFailure(failureAction);
    }
  }
}

/**
 * Handles paymentCheckRequest
 */
export function* paymentCheckRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof paymentCheck["request"]>
): Iterator<Effect> {
  // FIXME: we should not use default pagopa client for checkpayment, need to
  //        a client that doesn't retry on failure!!! checkpayment is NOT
  //        idempotent, the 2nd time it will error!
  const apiCheckPayment = () => pagoPaClient.checkPayment(action.payload);
  const checkPaymentWithRefresh = pmSessionManager.withRefresh(apiCheckPayment);
  try {
    const response: SagaCallReturnType<
      typeof checkPaymentWithRefresh
    > = yield call(checkPaymentWithRefresh);
    if (response.isRight()) {
      if (
        response.value.status === 200 ||
        (response.value.status as number) === 422
      ) {
        // TODO: remove the cast of response.status to number as soon as the
        //       paymentmanager specs include the 422 status.
        //       https://www.pivotaltracker.com/story/show/161053093
        yield put(paymentCheck.success(true));
      } else {
        throw response.value;
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (error) {
    yield put(paymentCheck.failure(error));
  }
}

/**
 * Handles paymentExecutePaymentRequest
 */
export function* paymentExecutePaymentRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof paymentExecutePayment["request"]>
): Iterator<Effect> {
  const apiPostPayment = pagoPaClient.postPayment(action.payload.idPayment, {
    data: { tipo: "web", idWallet: action.payload.wallet.idWallet }
  });
  const postPaymentWithRefresh = pmSessionManager.withRefresh(apiPostPayment);
  try {
    const response: SagaCallReturnType<
      typeof postPaymentWithRefresh
    > = yield call(postPaymentWithRefresh);

    if (response.isRight()) {
      if (response.value.status === 200) {
        const newTransaction = response.value.value.data;
        const successAction = paymentExecutePayment.success(newTransaction);
        yield put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (e) {
    yield put(paymentExecutePayment.failure(e));
  }
}

/**
 * Handles paymentDeletePaymentRequest
 */
export function* paymentDeletePaymentRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof paymentDeletePayment["request"]>
): Iterator<Effect> {
  const apiPostPayment = pagoPaClient.deletePayment(action.payload.paymentId);
  const request = pmSessionManager.withRefresh(apiPostPayment);
  try {
    const response: SagaCallReturnType<typeof request> = yield call(request);

    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(paymentDeletePayment.success());
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (e) {
    yield put(paymentDeletePayment.failure(e));
  }
}

//
// Nodo APIs
//

/**
 * Handles paymentVerificaRequest
 */
export function* paymentVerificaRequestHandler(
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"],
  action: ActionType<typeof paymentVerifica["request"]>
) {
  try {
    const isPagoPATestEnabled: ReturnType<
      typeof isPagoPATestEnabledSelector
    > = yield select<GlobalState>(isPagoPATestEnabledSelector);

    const response: SagaCallReturnType<typeof getVerificaRpt> = yield call(
      getVerificaRpt,
      {
        rptId: RptIdFromString.encode(action.payload),
        test: isPagoPATestEnabled
      }
    );
    if (response.isRight()) {
      if (response.value.status === 200) {
        // Verifica succeeded
        yield put(paymentVerifica.success(response.value.value));
      } else if (response.value.status === 500) {
        // Verifica failed with a 500, that usually means there was an error
        // interacting with pagoPA that we can interpret
        yield put(paymentVerifica.failure(response.value.value.detail));
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (e) {
    // Probably a timeout
    yield put(paymentVerifica.failure(e.message));
  }
}

/**
 * Handles paymentAttivaRequest
 */
export function* paymentAttivaRequestHandler(
  postAttivaRpt: ReturnType<typeof BackendClient>["postAttivaRpt"],
  action: ActionType<typeof paymentAttiva["request"]>
) {
  try {
    const isPagoPATestEnabled: ReturnType<
      typeof isPagoPATestEnabledSelector
    > = yield select<GlobalState>(isPagoPATestEnabledSelector);

    const response: SagaCallReturnType<typeof postAttivaRpt> = yield call(
      postAttivaRpt,
      {
        paymentActivationsPostRequest: {
          rptId: RptIdFromString.encode(action.payload.rptId),
          codiceContestoPagamento:
            action.payload.verifica.codiceContestoPagamento,
          importoSingoloVersamento:
            action.payload.verifica.importoSingoloVersamento
        },
        test: isPagoPATestEnabled
      }
    );
    if (response.isRight()) {
      if (response.value.status === 200) {
        // Attiva succeeded
        yield put(paymentAttiva.success(response.value.value));
      } else if (response.value.status === 500) {
        // Attiva failed
        throw Error(response.value.value.detail);
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (e) {
    // Probably a timeout
    yield put(paymentAttiva.failure(e.message));
  }
}

/**
 * Handles paymentIdPollingRequest
 *
 * Polls the backend for the paymentId linked to the payment context code
 */
export function* paymentIdPollingRequestHandler(
  getPaymentIdApi: ReturnType<typeof BackendClient>["getPaymentId"],
  action: ActionType<typeof paymentIdPolling["request"]>
) {
  // successfully request the payment activation
  // now poll until a paymentId is made available

  try {
    const isPagoPATestEnabled: ReturnType<
      typeof isPagoPATestEnabledSelector
    > = yield select<GlobalState>(isPagoPATestEnabledSelector);

    const response: SagaCallReturnType<typeof getPaymentIdApi> = yield call(
      getPaymentIdApi,
      {
        codiceContestoPagamento: action.payload.codiceContestoPagamento,
        test: isPagoPATestEnabled
      }
    );
    if (response.isRight()) {
      // Attiva succeeded
      if (response.value.status === 200) {
        yield put(paymentIdPolling.success(response.value.value.idPagamento));
      } else if (response.value.status === 400) {
        // Attiva failed
        throw Error("PAYMENT_ID_TIMEOUT");
      } else {
        throw Error(`response status ${response.value.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.value));
    }
  } catch (e) {
    yield put(paymentIdPolling.failure(e.message));
  }
}

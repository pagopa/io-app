import { RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { call, Effect, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";

import {
  ActivatePaymentT,
  GetActivationStatusT,
  GetPaymentInfoT
} from "../../../definitions/backend/requestTypes";
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
  fetchTransactionFailure,
  fetchTransactionRequest,
  fetchTransactionsFailure,
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
    if (getResponse !== undefined && getResponse.status === 200) {
      yield put(fetchWalletsSuccess(getResponse.value.data));
    } else {
      // FIXME: show relevant error
      yield put(fetchWalletsFailure(Error("Generic error")));
    }
  } catch {
    yield put(fetchWalletsFailure(Error("Generic error")));
  }
}

/**
 * Handles fetchTransactionsRequest
 */
export function* fetchTransactionsRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>
): Iterator<Effect> {
  const request = pmSessionManager.withRefresh(pagoPaClient.getTransactions);
  try {
    const response: SagaCallReturnType<typeof request> | undefined = yield call(
      request
    );
    if (response !== undefined && response.status === 200) {
      yield put(fetchTransactionsSuccess(response.value.data));
    } else {
      yield put(fetchTransactionsFailure(new Error("Generic error"))); // FIXME show relevant error (see story below)
    }
  } catch {
    yield put(fetchTransactionsFailure(new Error("Generic error")));
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
  const getTransaction = (pagoPaToken: PaymentManagerToken) =>
    pagoPaClient.getTransaction(pagoPaToken, action.payload);
  const request = pmSessionManager.withRefresh(getTransaction);
  try {
    const response: SagaCallReturnType<typeof request> | undefined = yield call(
      request
    );
    if (response !== undefined && response.status === 200) {
      yield put(fetchTransactionSuccess(response.value.data));
    } else {
      throw Error();
    }
  } catch {
    yield put(fetchTransactionFailure(new Error("Generic error")));
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
  const setFavouriteWallet = (pagoPaToken: PaymentManagerToken) =>
    pagoPaClient.favouriteWallet(pagoPaToken, favouriteWalletId);

  const request = pmSessionManager.withRefresh(setFavouriteWallet);
  try {
    const response: SagaCallReturnType<typeof request> = yield call(request);
    if (response !== undefined && response.status === 200) {
      yield put(setFavouriteWalletSuccess(response.value.data));
    } else {
      throw Error();
    }
  } catch {
    yield put(setFavouriteWalletFailure(Error()));
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

  const apiUpdateWalletPsp = (pagoPaToken: PaymentManagerToken) =>
    pagoPaClient.updateWalletPsp(pagoPaToken, wallet.idWallet, {
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

    if (response !== undefined && response.status === 200) {
      const getResponse: SagaCallReturnType<
        typeof getWalletsWithRefresh
      > = yield call(getWalletsWithRefresh);
      if (getResponse !== undefined && getResponse.status === 200) {
        // look for the updated wallet
        const updatedWallet = getResponse.value.data.find(
          _ => _.idWallet === wallet.idWallet
        );
        if (updatedWallet !== undefined) {
          // the wallet is still there, we can proceed
          const successAction = paymentUpdateWalletPsp.success({
            wallets: getResponse.value.data,
            updatedWallet: response.value.data
          });
          yield put(successAction);
          if (action.payload.onSuccess) {
            // signal the callee if requested
            action.payload.onSuccess(successAction);
          }
        } else {
          // oops, the wallet is not there anymore!
          throw Error();
        }
      } else {
        throw Error();
      }
    } else {
      throw Error();
    }
  } catch {
    const failureAction = paymentUpdateWalletPsp.failure(
      Error("Generic error")
    );
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
export function* deleteWalletRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof deleteWalletRequest>
): Iterator<Effect> {
  const deleteWalletApi = (token: PaymentManagerToken) =>
    pagoPaClient.deleteWallet(token, action.payload.walletId);
  const deleteWalletWithRefresh = pmSessionManager.withRefresh(deleteWalletApi);

  const getWalletsWithRefresh = pmSessionManager.withRefresh(
    pagoPaClient.getWallets
  );

  try {
    const deleteResponse: SagaCallReturnType<
      typeof deleteWalletWithRefresh
    > = yield call(deleteWalletWithRefresh);
    if (deleteResponse !== undefined && deleteResponse.status === 200) {
      const getResponse: SagaCallReturnType<
        typeof getWalletsWithRefresh
      > = yield call(getWalletsWithRefresh);
      if (getResponse !== undefined && getResponse.status === 200) {
        const successAction = deleteWalletSuccess(getResponse.value.data);
        yield put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
      } else {
        throw Error();
      }
    } else {
      throw Error();
    }
  } catch {
    const failureAction = deleteWalletFailure(Error("Generic error"));
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
  const boardCreditCard = (token: PaymentManagerToken) =>
    pagoPaClient.addWalletCreditCard(token, action.payload.creditcard);
  const boardCreditCardWithRefresh = pmSessionManager.withRefresh(
    boardCreditCard
  );

  try {
    const response: SagaCallReturnType<
      typeof boardCreditCardWithRefresh
    > = yield call(boardCreditCardWithRefresh);

    if (response !== undefined && response.status === 200) {
      yield put(addWalletCreditCardSuccess(response.value));
    } else if (
      response !== undefined &&
      response.status === 422 &&
      response.value.message === "creditcard.already_exists"
    ) {
      yield put(addWalletCreditCardFailure("ALREADY_EXISTS"));
    } else {
      throw Error();
    }
  } catch {
    yield put(addWalletCreditCardFailure("GENERIC_ERROR"));
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
  const boardPay = (token: PaymentManagerToken) =>
    pagoPaClient.payCreditCardVerification(
      token,
      action.payload.payRequest,
      action.payload.language
    );
  const boardPayWithRefresh = pmSessionManager.withRefresh(boardPay);
  try {
    const response: SagaCallReturnType<typeof boardPayWithRefresh> = yield call(
      boardPayWithRefresh
    );

    if (response !== undefined && response.status === 200) {
      yield put(payCreditCardVerificationSuccess(response.value));
    } else {
      throw Error();
    }
  } catch {
    yield put(payCreditCardVerificationFailure(Error("GENERIC_ERROR")));
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
  const apiGetPspList = (pagoPaToken: PaymentManagerToken) =>
    pagoPaClient.getPspList(
      pagoPaToken,
      action.payload.idPayment,
      action.payload.idWallet
    );
  const getPspListWithRefresh = pmSessionManager.withRefresh(apiGetPspList);
  try {
    const response: SagaCallReturnType<
      typeof getPspListWithRefresh
    > = yield call(getPspListWithRefresh);
    if (response !== undefined && response.status === 200) {
      const successAction = paymentFetchPspsForPaymentId.success(
        response.value.data
      );
      yield put(successAction);
      if (action.payload.onSuccess) {
        action.payload.onSuccess(successAction);
      }
    } else {
      throw Error();
    }
  } catch {
    const failureAction = paymentFetchPspsForPaymentId.failure(
      Error("GENERIC_ERROR")
    );
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
  const apiCheckPayment = (token: PaymentManagerToken) =>
    pagoPaClient.checkPayment(token, action.payload);
  const checkPaymentWithRefresh = pmSessionManager.withRefresh(apiCheckPayment);
  try {
    const response: SagaCallReturnType<
      typeof checkPaymentWithRefresh
    > = yield call(checkPaymentWithRefresh);
    if (
      response !== undefined &&
      (response.status === 200 || (response.status as number) === 422)
    ) {
      // TODO: remove the cast of response.status to number as soon as the
      //       paymentmanager specs include the 422 status.
      //       https://www.pivotaltracker.com/story/show/161053093
      yield put(paymentCheck.success(true));
    } else {
      yield put(paymentCheck.failure(response));
    }
  } catch {
    yield put(paymentCheck.failure(undefined));
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
  const apiPostPayment = (pagoPaToken: PaymentManagerToken) =>
    pagoPaClient.postPayment(pagoPaToken, action.payload.idPayment, {
      data: { tipo: "web", idWallet: action.payload.wallet.idWallet }
    });
  const postPaymentWithRefresh = pmSessionManager.withRefresh(apiPostPayment);
  try {
    const response: SagaCallReturnType<
      typeof postPaymentWithRefresh
    > = yield call(postPaymentWithRefresh);

    if (response !== undefined && response.status === 200) {
      const newTransaction = response.value.data;
      const successAction = paymentExecutePayment.success(newTransaction);
      yield put(successAction);
      if (action.payload.onSuccess) {
        action.payload.onSuccess(successAction);
      }
    } else {
      yield put(paymentExecutePayment.failure(Error("GENERIC_ERROR")));
    }
  } catch {
    yield put(paymentExecutePayment.failure(Error("GENERIC_ERROR")));
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
  const apiPostPayment = (pagoPaToken: PaymentManagerToken) =>
    pagoPaClient.deletePayment(pagoPaToken, action.payload.paymentId);
  const request = pmSessionManager.withRefresh(apiPostPayment);
  try {
    const response: SagaCallReturnType<typeof request> = yield call(request);

    if (response !== undefined && response.status === 200) {
      yield put(paymentDeletePayment.success());
    } else {
      throw Error();
    }
  } catch {
    yield put(paymentDeletePayment.failure());
  }
}

//
// Nodo APIs
//

/**
 * Handles paymentVerificaRequest
 */
export function* paymentVerificaRequestHandler(
  getVerificaRpt: TypeofApiCall<GetPaymentInfoT>,
  action: ActionType<typeof paymentVerifica["request"]>
) {
  try {
    const isPagoPATestEnabled: ReturnType<
      ReturnType<typeof isPagoPATestEnabledSelector>
    > = yield select<GlobalState>(isPagoPATestEnabledSelector);

    const response: SagaCallReturnType<typeof getVerificaRpt> = yield call(
      getVerificaRpt,
      {
        rptId: RptIdFromString.encode(action.payload),
        test: isPagoPATestEnabled
      }
    );
    if (response !== undefined && response.status === 200) {
      // Verifica succeeded
      yield put(paymentVerifica.success(response.value));
    } else if (response !== undefined && response.status === 500) {
      // Verifica failed with a 500, that usually means there was an error
      // interacting with Pagopa that we can interpret
      yield put(paymentVerifica.failure(response.value.detail));
    } else {
      // unknown error
      throw Error();
    }
  } catch {
    // Probably a timeout
    yield put(paymentVerifica.failure(undefined));
  }
}

/**
 * Handles paymentAttivaRequest
 */
export function* paymentAttivaRequestHandler(
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  action: ActionType<typeof paymentAttiva["request"]>
) {
  try {
    const isPagoPATestEnabled: ReturnType<
      ReturnType<typeof isPagoPATestEnabledSelector>
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
    if (response !== undefined && response.status === 200) {
      // Attiva succeeded
      yield put(paymentAttiva.success(response.value));
    } else if (response !== undefined && response.status === 500) {
      // Attiva failed
      yield put(paymentAttiva.failure(response.value.detail));
    } else {
      throw Error();
    }
  } catch {
    // Probably a timeout
    yield put(paymentAttiva.failure(undefined));
  }
}

/**
 * Handles paymentIdPollingRequest
 *
 * Polls the backend for the paymentId linked to the payment context code
 */
export function* paymentIdPollingRequestHandler(
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  action: ActionType<typeof paymentIdPolling["request"]>
) {
  // successfully request the payment activation
  // now poll until a paymentId is made available

  try {
    const isPagoPATestEnabled: ReturnType<
      ReturnType<typeof isPagoPATestEnabledSelector>
    > = yield select<GlobalState>(isPagoPATestEnabledSelector);

    const response: SagaCallReturnType<typeof getPaymentIdApi> = yield call(
      getPaymentIdApi,
      {
        codiceContestoPagamento: action.payload.codiceContestoPagamento,
        test: isPagoPATestEnabled
      }
    );
    if (response !== undefined && response.status === 200) {
      // Attiva succeeded
      yield put(paymentIdPolling.success(response.value.idPagamento));
    } else if (response !== undefined && response.status === 400) {
      // Attiva failed
      yield put(paymentIdPolling.failure("PAYMENT_ID_TIMEOUT"));
    } else {
      throw Error();
    }
  } catch {
    yield put(paymentIdPolling.failure(undefined));
  }
}

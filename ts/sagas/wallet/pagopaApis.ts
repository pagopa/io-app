import { RptIdFromString } from "italia-ts-commons/lib/pagopa";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { call, Effect, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";

import { CodiceContestoPagamento } from "../../../definitions/backend/CodiceContestoPagamento";
import {
  ActivatePaymentT,
  GetActivationStatusT,
  GetPaymentInfoT
} from "../../../definitions/backend/requestTypes";
import { PagoPaClient } from "../../api/pagopa";
import {
  paymentAttivaFailure,
  paymentAttivaRequest,
  paymentAttivaSuccess,
  paymentCheckFailure,
  paymentCheckRequest,
  paymentIdPollingFailure,
  paymentIdPollingSuccess,
  paymentVerificaFailure,
  paymentVerificaRequest,
  paymentVerificaSuccess,
  paymentFetchPspsForPaymentIdRequest,
  paymentFetchPspsForPaymentIdSuccess,
  paymentFetchPspsForPaymentIdFailure
} from "../../store/actions/wallet/payment";
import {
  fetchTransactionsFailure,
  fetchTransactionsSuccess
} from "../../store/actions/wallet/transactions";
import {
  deleteWalletFailure,
  deleteWalletRequest,
  deleteWalletSuccess,
  fetchWalletsFailure,
  fetchWalletsSuccess
} from "../../store/actions/wallet/wallets";
import {
  extractNodoError,
  extractPaymentManagerError
} from "../../types/errors";
import { PagopaToken } from "../../types/pagopa";
import { SagaCallReturnType } from "../../types/utils";
import { fetchWithTokenRefresh } from "./utils";

//
// Payment Manager APIs
//

/**
 * Handles fetchWalletsRequest
 */
export function* fetchWalletsRequestHandler(
  pagoPaClient: PagoPaClient
): Iterator<Effect> {
  try {
    const getResponse: SagaCallReturnType<
      typeof pagoPaClient.getWallets
    > = yield call(
      fetchWithTokenRefresh,
      pagoPaClient.getWallets,
      pagoPaClient
    );
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
  pagoPaClient: PagoPaClient
): Iterator<Effect> {
  try {
    const response:
      | SagaCallReturnType<typeof pagoPaClient.getTransactions>
      | undefined = yield call(
      fetchWithTokenRefresh,
      pagoPaClient.getTransactions,
      pagoPaClient
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
 * Handles deleteWalletRequest
 */
export function* deleteWalletRequestHandler(
  pagoPaClient: PagoPaClient,
  action: ActionType<typeof deleteWalletRequest>
): Iterator<Effect> {
  try {
    const deleteWalletApi = (token: PagopaToken) =>
      pagoPaClient.deleteWallet(token, action.payload);
    const deleteResponse: SagaCallReturnType<
      typeof deleteWalletApi
    > = yield call(fetchWithTokenRefresh, deleteWalletApi, pagoPaClient);
    if (deleteResponse !== undefined && deleteResponse.status === 200) {
      const getResponse: SagaCallReturnType<
        typeof pagoPaClient.getWallets
      > = yield call(
        fetchWithTokenRefresh,
        pagoPaClient.getWallets,
        pagoPaClient
      );
      if (getResponse !== undefined && getResponse.status === 200) {
        yield put(deleteWalletSuccess(getResponse.value.data));
      } else {
        // FIXME: show relevant error
        yield put(deleteWalletFailure(Error("Generic error")));
      }
    } else {
      yield put(deleteWalletFailure(Error("Generic error")));
    }
  } catch {
    yield put(deleteWalletFailure(Error("Generic error")));
  }
}

export function* paymentFetchPspsForWalletRequestHandler(
  pagoPaClient: PagoPaClient,
  action: ActionType<typeof paymentFetchPspsForPaymentIdRequest>
) {
  try {
    const apiGetPspList = (pagoPaToken: PagopaToken) =>
      pagoPaClient.getPspList(pagoPaToken, action.payload);
    const response: SagaCallReturnType<typeof apiGetPspList> = yield call(
      fetchWithTokenRefresh,
      apiGetPspList,
      pagoPaClient
    );
    if (response !== undefined && response.status === 200) {
      yield put(paymentFetchPspsForPaymentIdSuccess(response.value));
    } else {
      yield put(paymentFetchPspsForPaymentIdFailure(Error("GENERIC_ERROR")));
    }
  } catch {
    yield put(paymentFetchPspsForPaymentIdFailure(Error("GENERIC_ERROR")));
  }
}

export function* paymentCheckRequestHandler(
  pagoPaClient: PagoPaClient,
  action: ActionType<typeof paymentCheckRequest>
): Iterator<Effect> {
  try {
    // FIXME: we should not use default pagopa client for checkpayment, need to
    //        a client that doesn't retry on failure!!! checkpayment is NOT
    //        idempotent, the 2nd time it will error!
    const apiCheckPayment = (token: PagopaToken) =>
      pagoPaClient.checkPayment(token, action.payload);
    const response: SagaCallReturnType<typeof apiCheckPayment> = yield call(
      fetchWithTokenRefresh,
      apiCheckPayment,
      pagoPaClient
    );
    if (
      response === undefined ||
      (response.status !== 200 && (response.status as number) !== 422)
    ) {
      // TODO: remove the cast of response.status to number as soon as the
      //       paymentmanager specs include the 422 status.
      //       https://www.pivotaltracker.com/story/show/161053093
      yield put(
        paymentCheckFailure(
          Error(
            extractPaymentManagerError(
              response ? response.value.message : undefined
            )
          )
        )
      );
    } else {
      yield put(paymentCheckFailure(Error("GENERIC_ERROR")));
    }
  } catch {
    yield put(paymentCheckFailure(Error("GENERIC_ERROR")));
  }
}

//
// Nodo APIs
//

export function* paymentVerificaRequestHandler(
  getVerificaRpt: TypeofApiCall<GetPaymentInfoT>,
  action: ActionType<typeof paymentVerificaRequest>
) {
  try {
    const response: SagaCallReturnType<typeof getVerificaRpt> = yield call(
      getVerificaRpt,
      {
        rptId: RptIdFromString.encode(action.payload)
      }
    );
    if (response !== undefined && response.status === 200) {
      // Verifica succeeded
      yield put(paymentVerificaSuccess(response.value));
    } else {
      // Verifica failed
      yield put(paymentVerificaFailure(Error(extractNodoError(response))));
    }
  } catch {
    // Probably a timeout
    yield put(paymentVerificaFailure(Error("GENERIC_ERROR")));
  }
}

/**
 * Executes the "Attiva" operation on the PagoPa node.
 */
export function* paymentAttivaRequestHandler(
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  action: ActionType<typeof paymentAttivaRequest>
) {
  try {
    const response: SagaCallReturnType<typeof postAttivaRpt> = yield call(
      postAttivaRpt,
      {
        paymentActivationsPostRequest: {
          rptId: RptIdFromString.encode(action.payload.rptId),
          codiceContestoPagamento:
            action.payload.verifica.codiceContestoPagamento,
          importoSingoloVersamento:
            action.payload.verifica.importoSingoloVersamento
        }
      }
    );
    if (response !== undefined && response.status === 200) {
      // Attiva succeeded
      yield put(paymentAttivaSuccess(response.value));
    } else {
      // Attiva failed
      yield put(paymentAttivaFailure(Error(extractNodoError(response))));
    }
  } catch {
    // Probably a timeout
    yield put(paymentAttivaFailure(Error("GENERIC_ERROR")));
  }
}

/**
 * Polls the backend for the paymentId linked to the payment context code
 */
export function* paymentIdPollingRequestHandler(
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  paymentContextCode: CodiceContestoPagamento
) {
  // successfully request the payment activation
  // now poll until a paymentId is made available

  try {
    const response: SagaCallReturnType<typeof getPaymentIdApi> = yield call(
      getPaymentIdApi,
      {
        codiceContestoPagamento: paymentContextCode
      }
    );
    if (response !== undefined && response.status === 200) {
      // Attiva succeeded
      yield put(paymentIdPollingSuccess(response.value.idPagamento));
    } else {
      // Attiva failed
      yield put(
        paymentIdPollingFailure(
          Error(
            response !== undefined && response.status === 404
              ? "MISSING_PAYMENT_ID"
              : "GENERIC_ERROR"
          )
        )
      );
    }
  } catch {
    // Probably a timeout
    yield put(paymentIdPollingFailure(Error("GENERIC_ERROR")));
  }
}

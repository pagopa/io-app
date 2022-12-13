import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { call, put, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { PaymentManagerClient } from "../../api/pagopa";
import { mixpanelTrack } from "../../mixpanel";
import { getFilteredPspsList } from "../../screens/wallet/payment/common";
import { checkCurrentSession } from "../../store/actions/authentication";
import { deleteAllPaymentMethodsByFunction } from "../../store/actions/wallet/delete";
import {
  paymentAttiva,
  paymentCheck,
  paymentDeletePayment,
  paymentExecuteStart,
  paymentIdPolling,
  paymentUpdateWalletPsp,
  paymentVerifica,
  pspForPaymentV2,
  pspForPaymentV2WithCallbacks
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
  setFavouriteWalletFailure,
  setFavouriteWalletRequest,
  setFavouriteWalletSuccess,
  updatePaymentStatus
} from "../../store/actions/wallet/wallets";
import { preferredPspsByOriginSelector } from "../../store/reducers/backendStatus";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { paymentStartOriginSelector } from "../../store/reducers/wallet/payment";
import { PaymentManagerToken, Wallet } from "../../types/pagopa";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import {
  convertUnknownToError,
  getError,
  getErrorFromNetworkError,
  getGenericError,
  getNetworkError,
  getWalletError,
  isTimeoutError
} from "../../utils/errors";
import { readablePrivacyReport } from "../../utils/reporters";
import { SessionManager } from "../../utils/SessionManager";
import { convertWalletV2toWalletV1 } from "../../utils/walletv2";

//
// Payment Manager APIs
//

/**
 * Handles fetchWalletsRequest
 */

export function* getWallets(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>
): Generator<ReduxSagaEffect, E.Either<Error, ReadonlyArray<Wallet>>, any> {
  return yield* call(getWalletsV2, pagoPaClient, pmSessionManager);
}

// load wallet from api /v2/wallet
// it converts walletV2 into walletV1
export function* getWalletsV2(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>
): Generator<ReduxSagaEffect, E.Either<Error, ReadonlyArray<Wallet>>, any> {
  try {
    void mixpanelTrack("WALLETS_LOAD_REQUEST");
    const request = pmSessionManager.withRefresh(pagoPaClient.getWalletsV2);
    const getResponse: SagaCallReturnType<typeof request> = yield* call(
      request
    );
    if (E.isRight(getResponse)) {
      if (getResponse.right.status === 200) {
        const wallets = (getResponse.right.value.data ?? []).map(
          convertWalletV2toWalletV1
        );
        void mixpanelTrack("WALLETS_LOAD_SUCCESS", {
          count: wallets.length
        });
        yield* put(fetchWalletsSuccess(wallets));
        return E.right<Error, ReadonlyArray<Wallet>>(wallets);
      } else {
        throw Error(`response status ${getResponse.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(getResponse.left));
    }
  } catch (e) {
    const computedError = convertUnknownToError(e);

    // this is required to handle 401 response from PM
    // On 401 response sessionManager retries for X attempts to get a valid session
    // If it exceeds a fixed threshold of attempts a max retries error will be dispatched

    void mixpanelTrack("WALLETS_LOAD_FAILURE", {
      reason: computedError.message
    });

    if (isTimeoutError(getNetworkError(e))) {
      // check if also the IO session is expired
      yield* put(checkCurrentSession.request());
    }

    yield* put(fetchWalletsFailure(computedError));
    return E.left<Error, ReadonlyArray<Wallet>>(computedError);
  }
}

/**
 * Handles fetchTransactionsRequest
 */
export function* fetchTransactionsRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof fetchTransactionsRequest>
): Generator<ReduxSagaEffect, void, any> {
  const request = pmSessionManager.withRefresh(
    pagoPaClient.getTransactions(action.payload.start)
  );
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(
          fetchTransactionsSuccess({
            data: response.right.value.data,
            total: O.fromNullable(response.right.value.total)
          })
        );
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    yield* put(fetchTransactionsFailure(convertUnknownToError(e)));
  }
}

/**
 * Handles fetchTransactionRequest
 */
export function* fetchTransactionRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof fetchTransactionRequest>
): Generator<ReduxSagaEffect, void, any> {
  const request = pmSessionManager.withRefresh(
    pagoPaClient.getTransaction(action.payload)
  );
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(fetchTransactionSuccess(response.right.value.data));
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    yield* put(fetchTransactionFailure(convertUnknownToError(e)));
  }
}

/**
 * Handles fetchPspRequest
 */
export function* fetchPspRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof fetchPsp["request"]>
): Generator<ReduxSagaEffect, void, any> {
  const request = pmSessionManager.withRefresh(
    pagoPaClient.getPsp(action.payload.idPsp)
  );
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);

    if (E.isRight(response)) {
      if (response.right.status === 200) {
        const psp = response.right.value.data;
        const successAction = fetchPsp.success({
          idPsp: action.payload.idPsp,
          psp
        });
        yield* put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    const failureAction = fetchPsp.failure({
      idPsp: action.payload.idPsp,
      error: convertUnknownToError(e)
    });
    yield* put(failureAction);
    if (action.payload.onFailure) {
      action.payload.onFailure(failureAction);
    }
  }
}

/**
 * Handles the update of payment method status
 * (enable or disable a payment method to pay with pagoPa)
 */
export function* updatePaymentStatusSaga(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof updatePaymentStatus.request>
): Generator<ReduxSagaEffect, void, any> {
  const updatePayment = pagoPaClient.updatePaymentStatus(action.payload);
  const request = pmSessionManager.withRefresh(updatePayment);
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        if (response.right.value.data) {
          yield* put(
            updatePaymentStatus.success(
              convertWalletV2toWalletV1(response.right.value.data)
            )
          );
        } else {
          // this should not never happen (payload weak typed)
          yield* put(
            updatePaymentStatus.failure(
              getNetworkError(Error("payload is empty"))
            )
          );
        }
      } else {
        const errorStatus = Error(`response status ${response.right.status}`);
        yield* put(updatePaymentStatus.failure(getNetworkError(errorStatus)));
      }
    } else {
      const errorDescription = Error(readablePrivacyReport(response.left));
      yield* put(
        updatePaymentStatus.failure(getNetworkError(errorDescription))
      );
    }
  } catch (error) {
    yield* put(updatePaymentStatus.failure(getNetworkError(error)));
  }
}

/**
 * Handles setFavouriteWalletRequest
 */
export function* setFavouriteWalletRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof setFavouriteWalletRequest>
): Generator<ReduxSagaEffect, void, any> {
  const favouriteWalletId = action.payload;
  if (favouriteWalletId === undefined) {
    // FIXME: currently there is no way to unset a favourite wallet
    return;
  }
  const setFavouriteWallet = pagoPaClient.favouriteWallet(favouriteWalletId);

  const request = pmSessionManager.withRefresh(setFavouriteWallet);
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(setFavouriteWalletSuccess(response.right.value.data));
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    yield* put(setFavouriteWalletFailure(convertUnknownToError(e)));
  }
}

/**
 * Updates a Wallet with a new favorite PSP
 *
 * TODO: consider avoiding the fetch, let the application logic decide
 */
// eslint-disable-next-line
export function* updateWalletPspRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof paymentUpdateWalletPsp["request"]>
) {
  // First update the selected wallet (walletId) with the
  // new PSP (action.payload); then request a new list
  // of wallets (which will contain the updated PSP)
  const { wallet, psp, idPayment } = action.payload;
  const { id: idPsp } = psp;

  const apiUpdateWalletPsp = pagoPaClient.updateWalletPsp(wallet.idWallet, {
    data: { idPsp, idPagamentoFromEC: idPayment }
  });
  const updateWalletPspWithRefresh =
    pmSessionManager.withRefresh(apiUpdateWalletPsp);

  try {
    const response: SagaCallReturnType<typeof updateWalletPspWithRefresh> =
      yield* call(updateWalletPspWithRefresh);
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        const maybeWallets: SagaCallReturnType<typeof getWallets> = yield* call(
          getWallets,
          pagoPaClient,
          pmSessionManager
        );
        if (E.isRight(maybeWallets)) {
          // look for the updated wallet
          const updatedWallet = maybeWallets.right.find(
            _ => _.idWallet === wallet.idWallet
          );
          if (updatedWallet !== undefined) {
            // the wallet is still there, we can proceed
            const successAction = paymentUpdateWalletPsp.success({
              wallets: maybeWallets.right,
              // attention: updatedWallet is V1
              updatedWallet: response.right.value.data
            });
            yield* put(successAction);
            if (action.payload.onSuccess) {
              // signal the callee if requested
              action.payload.onSuccess(successAction);
            }
          } else {
            // oops, the wallet is not there anymore!
            throw Error(`response status ${response.right.status}`);
          }
        } else {
          throw maybeWallets.left;
        }
      } else {
        // oops, the wallet is not there anymore!
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    const failureAction = paymentUpdateWalletPsp.failure(
      convertUnknownToError(e)
    );
    yield* put(failureAction);
    if (action.payload.onFailure) {
      // signal the callee if requested
      action.payload.onFailure(failureAction);
    }
  }
}

/**
 * delete all those payment methods that have the specified function enabled
 * @param pagoPaClient
 * @param pmSessionManager
 * @param action
 */
export function* deleteAllPaymentMethodsByFunctionRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof deleteAllPaymentMethodsByFunction>
): Generator<ReduxSagaEffect, void, any> {
  const deleteAllByFunctionApi = pagoPaClient.deleteAllPaymentMethodsByFunction(
    action.payload as string
  );
  const deleteAllByFunctionApiWithRefresh = pmSessionManager.withRefresh(
    deleteAllByFunctionApi
  );

  try {
    const deleteResponse: SagaCallReturnType<
      typeof deleteAllByFunctionApiWithRefresh
    > = yield* call(deleteAllByFunctionApiWithRefresh);
    if (E.isRight(deleteResponse) && deleteResponse.right.status === 200) {
      const deletedMethodsCount =
        deleteResponse.right.value.data?.deletedWallets ?? -1;

      const remainingWallets = (
        deleteResponse.right.value.data?.remainingWallets ?? []
      ).map(convertWalletV2toWalletV1);

      const successAction = deleteAllPaymentMethodsByFunction.success({
        wallets: remainingWallets,
        deletedMethodsCount
      });
      yield* put(successAction);
    } else {
      const error = Error(
        pipe(
          deleteResponse,
          E.foldW(
            readablePrivacyReport,
            ({ status }) => `response status ${status}`
          )
        )
      );
      yield* put(
        deleteAllPaymentMethodsByFunction.failure({
          error
        })
      );
    }
  } catch (e) {
    yield* put(
      deleteAllPaymentMethodsByFunction.failure({
        error: getErrorFromNetworkError(getNetworkError(e))
      })
    );
  }
}

/**
 * Handles deleteWalletRequest
 *
 * TODO: consider avoiding the fetch, let the appliction logic decide
 */
// eslint-disable-next-line
export function* deleteWalletRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof deleteWalletRequest>
): Generator<ReduxSagaEffect, void, any> {
  const deleteWalletApi = pagoPaClient.deleteWallet(action.payload.walletId);
  const deleteWalletWithRefresh = pmSessionManager.withRefresh(deleteWalletApi);

  try {
    const deleteResponse: SagaCallReturnType<typeof deleteWalletWithRefresh> =
      yield* call(deleteWalletWithRefresh);
    if (E.isRight(deleteResponse) && deleteResponse.right.status === 200) {
      const maybeWallets: SagaCallReturnType<typeof getWallets> = yield* call(
        getWallets,
        pagoPaClient,
        pmSessionManager
      );
      if (E.isRight(maybeWallets)) {
        const successAction = deleteWalletSuccess(maybeWallets.right);
        yield* put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
      } else {
        throw maybeWallets.left;
      }
    } else {
      throw Error(
        pipe(
          deleteResponse,
          E.foldW(
            readablePrivacyReport,
            ({ status }) => `response status ${status}`
          )
        )
      );
    }
  } catch (e) {
    const failureAction = deleteWalletFailure(
      e instanceof Error ? e : new Error()
    );
    yield* put(failureAction);
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
  const boardCreditCardWithRefresh =
    pmSessionManager.withRefresh(boardCreditCard);

  try {
    const response: SagaCallReturnType<typeof boardCreditCardWithRefresh> =
      yield* call(boardCreditCardWithRefresh);

    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(addWalletCreditCardSuccess(response.right.value));
      } else if (
        response.right.status === 422 &&
        response.right.value.message === "creditcard.already_exists"
      ) {
        yield* put(addWalletCreditCardFailure({ kind: "ALREADY_EXISTS" }));
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    yield* put(
      addWalletCreditCardFailure({
        kind: "GENERIC_ERROR",
        reason: getError(e).message
      })
    );
  }
}

/**
 * Handles paymentCheckRequest
 */
export function* paymentCheckRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof paymentCheck["request"]>
): Generator<ReduxSagaEffect, void, any> {
  // FIXME: we should not use default pagopa client for checkpayment, need to
  //        a client that doesn't retry on failure!!! checkpayment is NOT
  //        idempotent, the 2nd time it will error!
  const apiCheckPayment = () => pagoPaClient.checkPayment(action.payload);
  const checkPaymentWithRefresh = pmSessionManager.withRefresh(apiCheckPayment);
  try {
    const response: SagaCallReturnType<typeof checkPaymentWithRefresh> =
      yield* call(checkPaymentWithRefresh);
    if (E.isRight(response)) {
      if (
        response.right.status === 200 ||
        (response.right.status as number) === 422
      ) {
        // TODO: remove the cast of response.status to number as soon as the
        //       paymentmanager specs include the 422 status.
        //       https://www.pivotaltracker.com/story/show/161053093
        yield* put(paymentCheck.success(true));
      } else {
        throw response.right;
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    yield* put(paymentCheck.failure(e instanceof Error ? e : new Error()));
  }
}

/**
 * handle the start of a payment
 * we already know which is the payment (idPayment) and the used wallet to pay (idWallet)
 * we need a fresh PM session token to start the challenge into the PayWebViewModal
 * @param pmSessionManager
 */
export function* paymentStartRequest(
  pmSessionManager: SessionManager<PaymentManagerToken>
) {
  const pmSessionToken: O.Option<PaymentManagerToken> = yield* call(
    pmSessionManager.getNewToken
  );
  if (O.isSome(pmSessionToken)) {
    yield* put(paymentExecuteStart.success(pmSessionToken.value));
  } else {
    yield* put(
      paymentExecuteStart.failure(
        new Error("cannot retrieve a valid PM session token")
      )
    );
  }
}

/**
 * Handles paymentDeletePaymentRequest
 */
export function* paymentDeletePaymentRequestHandler(
  pagoPaClient: PaymentManagerClient,
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof paymentDeletePayment["request"]>
): Generator<ReduxSagaEffect, void, any> {
  const apiPostPayment = pagoPaClient.deletePayment(action.payload.paymentId);
  const request = pmSessionManager.withRefresh(apiPostPayment);
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);

    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(paymentDeletePayment.success());
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    yield* put(
      paymentDeletePayment.failure(e instanceof Error ? e : new Error())
    );
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
    const isPagoPATestEnabled: ReturnType<typeof isPagoPATestEnabledSelector> =
      yield* select(isPagoPATestEnabledSelector);

    const response: SagaCallReturnType<typeof getVerificaRpt> = yield* call(
      getVerificaRpt,
      {
        rptId: RptIdFromString.encode(action.payload.rptId),
        test: isPagoPATestEnabled
      }
    );
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        // Verifica succeeded
        yield* put(paymentVerifica.success(response.right.value));
      } else if (response.right.status === 500) {
        // Verifica failed with a 500, that usually means there was an error
        // interacting with pagoPA that we can interpret
        yield* put(paymentVerifica.failure(response.right.value.detail_v2));
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    // Probably a timeout
    yield* put(paymentVerifica.failure(getWalletError(e)));
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
    const isPagoPATestEnabled: ReturnType<typeof isPagoPATestEnabledSelector> =
      yield* select(isPagoPATestEnabledSelector);

    const response: SagaCallReturnType<typeof postAttivaRpt> = yield* call(
      postAttivaRpt,
      {
        body: {
          rptId: RptIdFromString.encode(action.payload.rptId),
          codiceContestoPagamento:
            action.payload.verifica.codiceContestoPagamento,
          importoSingoloVersamento:
            action.payload.verifica.importoSingoloVersamento
        },
        test: isPagoPATestEnabled
      }
    );
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        // Attiva succeeded
        yield* put(paymentAttiva.success(response.right.value));
      } else if (response.right.status === 500) {
        // Attiva failed
        throw Error(response.right.value.detail_v2);
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    // Probably a timeout
    yield* put(paymentAttiva.failure(getWalletError(e)));
  }
}

/**
 * Handles paymentIdPollingRequest
 *
 * Polls the backend for the paymentId linked to the payment context code
 */
export function* paymentIdPollingRequestHandler(
  getPaymentIdApi: ReturnType<ReturnType<typeof BackendClient>["getPaymentId"]>,
  action: ActionType<typeof paymentIdPolling["request"]>
) {
  // successfully request the payment activation
  // now poll until a paymentId is made available

  try {
    const isPagoPATestEnabled: ReturnType<typeof isPagoPATestEnabledSelector> =
      yield* select(isPagoPATestEnabledSelector);

    const getPaymentId = getPaymentIdApi.e2;
    const response: SagaCallReturnType<typeof getPaymentId> = yield* call(
      getPaymentId,
      {
        codiceContestoPagamento: action.payload.codiceContestoPagamento,
        test: isPagoPATestEnabled
      }
    );
    if (E.isRight(response)) {
      // Attiva succeeded
      if (response.right.status === 200) {
        yield* put(paymentIdPolling.success(response.right.value.idPagamento));
      } else if (response.right.status === 400) {
        // Attiva failed
        throw Error("PAYMENT_ID_TIMEOUT");
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    yield* put(paymentIdPolling.failure("PAYMENT_ID_TIMEOUT"));
  }
}

/**
 * request the list of psp that can handle a payment from a given idWallet and idPayment
 * @param getPspV2
 * @param pmSessionManager
 * @param action
 */
export function* getPspV2(
  getPspV2: ReturnType<typeof PaymentManagerClient>["getPspV2"],
  pmSessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof pspForPaymentV2["request"]>
) {
  const getPspV2Request = getPspV2(action.payload);
  const request = pmSessionManager.withRefresh(getPspV2Request);
  try {
    const response: SagaCallReturnType<typeof request> = yield* call(request);
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        const psps = response.right.value.data;

        const paymentStartOrigin = yield* select(paymentStartOriginSelector);
        const preferredPspsByOrigin = yield* select(
          preferredPspsByOriginSelector
        );

        const filteredPsps = getFilteredPspsList(
          psps,
          paymentStartOrigin,
          preferredPspsByOrigin
        );
        yield* put(pspForPaymentV2.success(filteredPsps));
      } else {
        yield* put(
          pspForPaymentV2.failure(
            getGenericError(Error(`response status ${response.right.status}`))
          )
        );
      }
    } else {
      yield* put(
        pspForPaymentV2.failure(
          getGenericError(Error(readablePrivacyReport(response.left)))
        )
      );
    }
  } catch (e) {
    yield* put(pspForPaymentV2.failure(getNetworkError(e)));
  }
}

/**
 * @deprecated this function request and handle the psp list by using a callback approach
 * it should not be used!
 * Use instead {@link pspForPaymentV2} action and relative saga {@link getPspV2} to retrieve the psp list
 */
export function* getPspV2WithCallbacks(
  action: ActionType<typeof pspForPaymentV2WithCallbacks>
) {
  yield* put(pspForPaymentV2.request(action.payload));
  const result = yield* take<
    ActionType<typeof pspForPaymentV2.success | typeof pspForPaymentV2.failure>
  >([pspForPaymentV2.success, pspForPaymentV2.failure]);
  if (isActionOf(pspForPaymentV2.failure, result)) {
    action.payload.onFailure();
  } else if (isActionOf(pspForPaymentV2.success, result)) {
    const psps = result.payload;

    const paymentStartOrigin = yield* select(paymentStartOriginSelector);
    const preferredPspsByOrigin = yield* select(preferredPspsByOriginSelector);

    const filteredPsps = getFilteredPspsList(
      psps,
      paymentStartOrigin,
      preferredPspsByOrigin
    );

    action.payload.onSuccess(filteredPsps);
  }
}

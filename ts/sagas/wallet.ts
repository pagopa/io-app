import { paymentCancel } from "./../store/actions/wallet/payment";

/**
 * A saga that manages the Wallet.
 */

import { Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCentsFromNumber } from "italia-ts-commons/lib/pagopa";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { NavigationActions } from "react-navigation";
import {
  call,
  Effect,
  fork,
  put,
  race,
  select,
  take
} from "redux-saga/effects";
import { CodiceContestoPagamento } from "../../definitions/backend/CodiceContestoPagamento";
import { EnteBeneficiario } from "../../definitions/backend/EnteBeneficiario";
import { Iban } from "../../definitions/backend/Iban";
import { ImportoEuroCents } from "../../definitions/backend/ImportoEuroCents";
import { PaymentRequestsGetResponse } from "../../definitions/backend/PaymentRequestsGetResponse";
import { PagoPaClient } from "../api/pagopa";
import { WalletAPI } from "../api/wallet/wallet-api";
import ROUTES from "../navigation/routes";
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_WALLETS_REQUEST,
  LOGOUT_SUCCESS,
  PAYMENT_COMPLETED,
  PAYMENT_REQUEST_CANCEL,
  PAYMENT_REQUEST_COMPLETION,
  PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
  PAYMENT_REQUEST_GO_BACK,
  PAYMENT_REQUEST_MANUAL_ENTRY,
  PAYMENT_REQUEST_MESSAGE,
  PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_PICK_PSP,
  PAYMENT_REQUEST_QR_CODE,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  PAYMENT_UPDATE_PSP,
  PAYMENT_UPDATE_PSP_IN_STATE
} from "../store/actions/constants";
import { storePagoPaToken } from "../store/actions/wallet/pagopa";
import {
  paymentConfirmPaymentMethod,
  paymentGoBack,
  paymentInitialConfirmPaymentMethod,
  paymentInitialPickPaymentMethod,
  paymentInitialPickPsp,
  paymentManualEntry,
  paymentPickPaymentMethod,
  paymentPickPsp,
  paymentQrCode,
  PaymentRequestCancel,
  PaymentRequestCompletion,
  PaymentRequestConfirmPaymentMethod,
  paymentRequestConfirmPaymentMethod,
  PaymentRequestContinueWithPaymentMethods,
  PaymentRequestGoBack,
  PaymentRequestManualEntry,
  PaymentRequestPickPaymentMethod,
  PaymentRequestPickPsp,
  PaymentRequestTransactionSummaryActions,
  paymentTransactionSummaryFromBanner,
  paymentTransactionSummaryFromRptId,
  PaymentUpdatePsp
} from "../store/actions/wallet/payment";
import {
  selectTransactionForDetails,
  storeNewTransaction,
  transactionsFetched
} from "../store/actions/wallet/transactions";
import {
  selectWalletForDetails,
  walletsFetched
} from "../store/actions/wallet/wallets";
import { getPagoPaToken } from "../store/reducers/wallet/pagopa";
import {
  getCurrentAmount,
  getPaymentReason,
  getPaymentRecipient,
  getPspList,
  getSelectedPaymentMethod,
  isGlobalStateWithPaymentId,
  selectedPaymentMethodSelector
} from "../store/reducers/wallet/payment";
import {
  feeExtractor,
  getFavoriteWalletId,
  specificWalletSelector
} from "../store/reducers/wallet/wallets";
import { Transaction } from "../types/pagopa";
import { Psp, Wallet } from "../types/pagopa";
import {
  UNKNOWN_AMOUNT,
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_RECIPIENT
} from "../types/unknown";
import { SagaCallReturnType } from "../types/utils";
import { getPin } from "../utils/keychain";
import { loginWithPinSaga } from "./startup/pinLoginSaga";
import { watchPinResetSaga } from "./startup/watchPinResetSaga";

// allow refreshing token this number of times
const MAX_TOKEN_REFRESHES = 2;

function* fetchTransactions(
  pagoPaClient: PagoPaClient,
  walletToken: string,
  token: string,
  retries: number = MAX_TOKEN_REFRESHES
): Iterator<Effect> {
  if (retries === 0) {
    // max retries reached
    // show "unauthorized" error @https://www.pivotaltracker.com/story/show/159400682
    return;
  }
  const response: SagaCallReturnType<
    typeof pagoPaClient.getTransactions
  > = yield call(pagoPaClient.getTransactions, token);
  if (response !== undefined) {
    if (response.status === 200) {
      // ok, all good
      yield put(transactionsFetched(response.value.data));
    } else if (response.status === 401) {
      // unauthorized -- try refreshing the token
      yield call(fetchPagoPaToken, pagoPaClient, walletToken);
      // retrieve the newly stored token and use it for
      // the following request
      const newToken: Option<string> = yield select(getPagoPaToken);
      if (newToken.isSome()) {
        yield call(
          fetchTransactions,
          pagoPaClient,
          walletToken,
          newToken.value,
          retries - 1
        );
      }
    }
    // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  }
}

function* fetchWallets(
  pagoPaClient: PagoPaClient,
  walletToken: string,
  token: string,
  retries: number = MAX_TOKEN_REFRESHES
): Iterator<Effect> {
  const response: SagaCallReturnType<
    typeof pagoPaClient.getWallets
  > = yield call(pagoPaClient.getWallets, token);
  if (response !== undefined) {
    if (response.status === 200) {
      yield put(walletsFetched(response.value.data));
    } else if (response.status === 401) {
      // unauthorized -- try refreshing the token
      yield call(fetchPagoPaToken, pagoPaClient, walletToken);
      const newToken: Option<string> = yield select(getPagoPaToken);
      if (newToken.isSome()) {
        yield call(
          fetchWallets,
          pagoPaClient,
          walletToken,
          newToken.value,
          retries - 1
        );
      }
    }
    // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  }
}

const navigateTo = (routeName: string, params?: object) => {
  return NavigationActions.navigate({ routeName, params });
};

function* paymentSagaFromQrCode(): Iterator<Effect> {
  yield put(paymentQrCode());
  yield put(navigateTo(ROUTES.PAYMENT_SCAN_QR_CODE)); // start by showing qr code scanner
  yield fork(watchPaymentSaga);
}

function* paymentSagaFromMessage(): Iterator<Effect> {
  yield fork(watchPaymentSaga);
}

function* watchPaymentSaga(): Iterator<Effect> {
  while (true) {
    const action = yield take([
      PAYMENT_REQUEST_QR_CODE,
      PAYMENT_REQUEST_MANUAL_ENTRY,
      PAYMENT_REQUEST_TRANSACTION_SUMMARY,
      PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
      PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
      PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
      PAYMENT_REQUEST_PICK_PSP,
      PAYMENT_UPDATE_PSP,
      PAYMENT_REQUEST_COMPLETION,
      PAYMENT_REQUEST_GO_BACK,
      PAYMENT_REQUEST_CANCEL,
      PAYMENT_COMPLETED
    ]);
    if (action.type === PAYMENT_COMPLETED) {
      break;
    }

    switch (action.type) {
      case PAYMENT_REQUEST_MANUAL_ENTRY: {
        yield fork(enterDataManuallyHandler, action);
        break;
      }
      case PAYMENT_REQUEST_TRANSACTION_SUMMARY: {
        yield fork(showTransactionSummaryHandler, action);
        break;
      }
      case PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS: {
        yield fork(continueWithPaymentMethodsHandler, action);
        break;
      }
      case PAYMENT_REQUEST_PICK_PAYMENT_METHOD: {
        yield fork(pickPaymentMethodHandler, action);
        break;
      }
      case PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD: {
        yield fork(confirmPaymentMethodHandler, action);
        break;
      }
      case PAYMENT_REQUEST_PICK_PSP: {
        yield fork(pickPspHandler, action);
        break;
      }
      case PAYMENT_UPDATE_PSP: {
        yield fork(updatePspHandler, action);
        break;
      }
      case PAYMENT_REQUEST_COMPLETION: {
        yield fork(completionHandler, action);
        break;
      }
      case PAYMENT_REQUEST_GO_BACK: {
        yield fork(goBackHandler, action);
        break;
      }
      case PAYMENT_REQUEST_CANCEL: {
        yield fork(cancelPaymentHandler, action);
        break;
      }
    }
  }
}

function* cancelPaymentHandler(_: PaymentRequestCancel) {
  yield put(paymentCancel()); // empty the stack
  yield put(navigateTo(ROUTES.WALLET_HOME));
}

function* goBackHandler(_: PaymentRequestGoBack) {
  yield put(paymentGoBack()); // return to previous state
  yield put(NavigationActions.back());
}

function* enterDataManuallyHandler(
  _: PaymentRequestManualEntry
): Iterator<Effect> {
  // from the QR code screen the user selected
  // the option for entering the data manually
  // -> navigate to manual data insertion screen
  yield put(paymentManualEntry());
  yield put(navigateTo(ROUTES.PAYMENT_MANUAL_DATA_INSERTION));
}

function* showTransactionSummaryHandler(
  action: PaymentRequestTransactionSummaryActions
) {
  // the user may have gotten here from the QR code,
  // the manual data entry, from a message OR by
  // tapping on the payment banner further in the process.
  // in all cases but the last one, a payload will be
  // provided, and it will contain the RptId information
  if (action.kind === "fromRptId") {
    // either the QR code has been read, or the
    // data has been entered manually. Store the
    // payload and proceed with showing the
    // transaction information fetched from the
    // pagoPA proxy
    const {
      rptId,
      initialAmount
    }: { rptId: RptId; initialAmount: AmountInEuroCents } = action.payload;

    // TODO: fetch the data from the pagoPA proxy
    // @https://www.pivotaltracker.com/story/show/159494746
    const verificaResponse: PaymentRequestsGetResponse = {
      importoSingoloVersamento: 10052 as ImportoEuroCents,
      codiceContestoPagamento: "6793ad707f9b11e888482902221575ae" as CodiceContestoPagamento,
      ibanAccredito: "IT17X0605502100000001234567" as Iban,
      causaleVersamento: "IMU 2018",
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: "123",
        denominazioneBeneficiario: "Comune di Canicattì",
        codiceUnitOperBeneficiario: "01",
        denomUnitOperBeneficiario: "CDC",
        indirizzoBeneficiario: "Via Roma",
        civicoBeneficiario: "23",
        capBeneficiario: "92010",
        localitaBeneficiario: "Canicattì",
        provinciaBeneficiario: "Agrigento",
        nazioneBeneficiario: "IT"
      } as EnteBeneficiario
    };
    yield put(
      paymentTransactionSummaryFromRptId(rptId, initialAmount, verificaResponse)
    );
  } else {
    yield put(paymentTransactionSummaryFromBanner());
  }
  // also, show summary screen
  yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));
}

function* showWalletOrSelectPsp(idWallet: number, paymentId?: string) {
  const wallet: Option<Wallet> = yield select(specificWalletSelector(idWallet));
  if (wallet.isSome()) {
    // TODO: fetch list of PSPs available here
    // @https://www.pivotaltracker.com/story/show/159494746
    const pspList = WalletAPI.getPsps();

    // show card
    // if multiple psps are available and one
    // has not yet been selected, show psp list
    if (pspList.length > 1 && wallet.value.psp === undefined) {
      // multiple choices here and no favorite wallet exists
      // show list of psps
      yield put(
        paymentId === undefined
          ? paymentPickPsp(wallet.value.idWallet, pspList)
          : paymentInitialPickPsp(wallet.value.idWallet, pspList, paymentId)
      );
      yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
    } else {
      // only 1 choice of psp, or psp already selected (in previous transaction)
      yield put(
        paymentId === undefined
          ? paymentConfirmPaymentMethod(wallet.value.idWallet, pspList)
          : paymentInitialConfirmPaymentMethod(
              wallet.value.idWallet,
              pspList,
              paymentId
            )
      );
      yield put(navigateTo(ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD));
    }
  }
}

function* continueWithPaymentMethodsHandler(
  _: PaymentRequestContinueWithPaymentMethods
) {
  // find out whether a payment method has already
  // been defined as favorite. If so, use it and
  // ask the user to confirm it
  // Otherwise, show a list of payment methods available
  // TODO: if no payment method is available (or if the
  // user chooses to do so), allow adding a new one.
  const favoriteWallet: Option<number> = yield select(getFavoriteWalletId);
  const hasPaymentId: boolean = yield select(isGlobalStateWithPaymentId);

  // TODO get this from "attiva" (if hasPaymentId is false)
  // @https://www.pivotaltracker.com/story/show/159494746
  const idPayment = "f2737c4448ac1c669049296aa4d09801";

  if (favoriteWallet.isSome()) {
    yield call(
      showWalletOrSelectPsp,
      favoriteWallet.value,
      hasPaymentId ? undefined : idPayment
    );
  } else {
    // no favorite wallet selected
    // show list
    yield put(
      hasPaymentId
        ? paymentPickPaymentMethod()
        : paymentInitialPickPaymentMethod(idPayment)
    );
    yield put(navigateTo(ROUTES.PAYMENT_PICK_PAYMENT_METHOD));
  }
}

function* confirmPaymentMethodHandler(
  action: PaymentRequestConfirmPaymentMethod
) {
  const walletId = action.payload;
  // this will either show the recap screen (if the selected
  // wallet already has a PSP), or it will show the
  // "pick psp" screen
  yield call(showWalletOrSelectPsp, walletId);
}

function* pickPaymentMethodHandler(_: PaymentRequestPickPaymentMethod) {
  // show screen with list of payment methods available
  yield put(paymentPickPaymentMethod());
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PAYMENT_METHOD));
}

function* pickPspHandler(_: PaymentRequestPickPsp) {
  const walletId: number = yield select(getSelectedPaymentMethod);
  const pspList: ReadonlyArray<Psp> = yield select(getPspList);

  yield put(paymentPickPsp(walletId, pspList));
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
}

function* updatePspHandler(action: PaymentUpdatePsp) {
  // TODO: register action.paylod (pspId) as the
  // selected pspId for walletId (from getSelectedPaymentMethod)
  // then, refresh the list of available payment methods.
  // @https://www.pivotaltracker.com/story/show/159494746
  const pspList = WalletAPI.getPsps();
  const walletId: number = yield select(getSelectedPaymentMethod);
  const psp = pspList.find(p => p.id === action.payload);
  if (psp !== undefined) {
    yield put({ type: PAYMENT_UPDATE_PSP_IN_STATE, payload: psp, walletId });
  }
  yield put(paymentRequestConfirmPaymentMethod(walletId));

  // Finally, return to the list of psp handlers
}

function* completionHandler(_: PaymentRequestCompletion) {
  // -> it should proceed with the required operations
  // and terminate with the "new payment" screen

  /**
   * ask and check PIN before proceed with payment
   * TODO: apply suggestion - https://github.com/teamdigitale/italia-app/pull/446
   */
  // Retrieve the configured PIN from the keychain
  const storedPin: SagaCallReturnType<typeof getPin> = yield call(getPin);
  if (storedPin.isSome()) {
    yield race({
      proceed: call(loginWithPinSaga, storedPin.value),
      reset: call(watchPinResetSaga)
    });
  }

  // do payment stuff (-> pagoPA REST)
  // retrieve transaction and store it
  // mocked data here
  const wallet: Wallet = yield select(selectedPaymentMethodSelector);

  const selectedRecipient: Option<EnteBeneficiario> = yield select(
    getPaymentRecipient
  );
  const recipient = selectedRecipient.getOrElse(UNKNOWN_RECIPIENT);

  const selectedPaymentReason: Option<string> = yield select(getPaymentReason);
  const paymentReason = selectedPaymentReason.getOrElse(UNKNOWN_PAYMENT_REASON);

  const selectedCurrentAmount: AmountInEuroCents = yield select(
    getCurrentAmount
  );
  const amount =
    100 * AmountInEuroCentsFromNumber.encode(selectedCurrentAmount);
  const feeOrUndefined = feeExtractor(wallet);
  const fee =
    100 *
    AmountInEuroCentsFromNumber.encode(
      feeOrUndefined === undefined ? UNKNOWN_AMOUNT : feeOrUndefined
    );
  const now = new Date();

  const transaction: Transaction = {
    id: Math.floor(Math.random() * 1000),
    amount: {
      amount,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: now,
    description: paymentReason,
    error: false,
    fee: {
      amount: fee,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    grandTotal: {
      amount: amount + fee,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: Math.floor(Math.random() * 1000),
    idPsp: 1,
    idStatus: 1,
    idWallet: wallet.idWallet,
    merchant: recipient.denominazioneBeneficiario,
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: now,
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  };

  yield put(storeNewTransaction(transaction));
  yield put(selectTransactionForDetails(transaction));
  yield put(selectWalletForDetails(wallet.idWallet)); // for the banner
  yield put(
    // TODO: this should use StackActions.reset
    // to reset the navigation. Right now, the
    // "back" option is not allowed -- so the user cannot
    // get back to previous screens, but the navigation
    // stack should be cleaned right here
    // @https://www.pivotaltracker.com/story/show/159300579
    navigateTo(ROUTES.WALLET_TRANSACTION_DETAILS, {
      paymentCompleted: true
    })
  );
  yield put({ type: PAYMENT_COMPLETED });
}

function* fetchPagoPaToken(
  pagoPaClient: PagoPaClient,
  walletToken: string
): Iterator<Effect> {
  const response: SagaCallReturnType<
    typeof pagoPaClient.getSession
  > = yield call(pagoPaClient.getSession, walletToken);
  if (response !== undefined && response.status === 200) {
    // token fetched successfully, store it
    yield put(storePagoPaToken(some(response.value.data.sessionToken)));
  }
}

export function* watchWalletSaga(
  pagoPaClient: PagoPaClient,
  walletToken: string
): Iterator<Effect> {
  yield call(fetchPagoPaToken, pagoPaClient, walletToken);

  while (true) {
    const action = yield take([
      FETCH_TRANSACTIONS_REQUEST,
      FETCH_WALLETS_REQUEST,
      LOGOUT_SUCCESS,
      PAYMENT_REQUEST_QR_CODE,
      PAYMENT_REQUEST_MESSAGE
    ]);

    const pagoPaToken: Option<string> = yield select(getPagoPaToken);

    if (action.type === FETCH_TRANSACTIONS_REQUEST && pagoPaToken.isSome()) {
      yield fork(
        fetchTransactions,
        pagoPaClient,
        walletToken,
        pagoPaToken.value
      );
    }
    if (action.type === FETCH_WALLETS_REQUEST && pagoPaToken.isSome()) {
      yield fork(fetchWallets, pagoPaClient, walletToken, pagoPaToken.value);
    }
    // if the user logs out, go back to waiting
    // for a WALLET_TOKEN_LOAD_SUCCESS action
    if (action.type === LOGOUT_SUCCESS) {
      break;
    }
    if (action.type === PAYMENT_REQUEST_QR_CODE) {
      yield fork(paymentSagaFromQrCode);
    }
    if (action.type === PAYMENT_REQUEST_MESSAGE) {
      yield fork(paymentSagaFromMessage);
    }
  }
}

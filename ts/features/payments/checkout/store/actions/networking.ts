import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { AmountEuroCents } from "../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { CalculateFeeRequest } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeRequest";
import { CalculateFeeResponse } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { NewSessionTokenResponse } from "../../../../../../definitions/pagopa/ecommerce/NewSessionTokenResponse";
import { NewTransactionRequest } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionRequest";
import { NewTransactionResponse } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RequestAuthorizationResponse } from "../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { TransactionInfo } from "../../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { Wallets } from "../../../../../../definitions/pagopa/ecommerce/Wallets";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodsResponse";
import { NetworkError } from "../../../../../utils/errors";
import { WalletPaymentFailure } from "../../types/WalletPaymentFailure";

export const paymentsGetNewSessionTokenAction = createAsyncAction(
  "PAYMENTS_GET_NEW_SESSION_TOKEN_REQUEST",
  "PAYMENTS_GET_NEW_SESSION_TOKEN_SUCCESS",
  "PAYMENTS_GET_NEW_SESSION_TOKEN_FAILURE"
)<undefined, NewSessionTokenResponse, NetworkError>();

export const paymentsGetPaymentDetailsAction = createAsyncAction(
  "PAYMENTS_GET_PAYMENT_DETAILS_REQUEST",
  "PAYMENTS_GET_PAYMENT_DETAILS_SUCCESS",
  "PAYMENTS_GET_PAYMENT_DETAILS_FAILURE"
)<RptId, PaymentRequestsGetResponse, NetworkError | WalletPaymentFailure>();

export const paymentsGetPaymentMethodsAction = createAsyncAction(
  "PAYMENTS_GET_PAYMENT_METHODS_REQUEST",
  "PAYMENTS_GET_PAYMENT_METHODS_SUCCESS",
  "PAYMENTS_GET_PAYMENT_METHODS_FAILURE"
)<undefined, PaymentMethodsResponse, NetworkError>();

export const paymentsGetPaymentUserMethodsAction = createAsyncAction(
  "PAYMENTS_GET_PAYMENT_USER_METHODS_REQUEST",
  "PAYMENTS_GET_PAYMENT_USER_METHODS_SUCCESS",
  "PAYMENTS_GET_PAYMENT_USER_METHODS_FAILURE"
)<undefined, Wallets, NetworkError>();

export const paymentsCalculatePaymentFeesAction = createAsyncAction(
  "PAYMENTS_CALCULATE_FEES_REQUEST",
  "PAYMENTS_CALCULATE_FEES_SUCCESS",
  "PAYMENTS_CALCULATE_FEES_FAILURE"
)<
  CalculateFeeRequest & { paymentMethodId: string },
  CalculateFeeResponse,
  NetworkError
>();

export const paymentsCreateTransactionAction = createAsyncAction(
  "PAYMENTS_CREATE_TRANSACTION_REQUEST",
  "PAYMENTS_PAYMENT_CREATE_TRANSACTION_SUCCESS",
  "PAYMENTS_PAYMENT_CREATE_TRANSACTION_FAILURE"
)<
  NewTransactionRequest,
  NewTransactionResponse,
  NetworkError | WalletPaymentFailure
>();

export const paymentsGetPaymentTransactionInfoAction = createAsyncAction(
  "PAYMENTS_GET_PAYMENT_TRANSACTION_INFO_REQUEST",
  "PAYMENTS_GET_PAYMENT_TRANSACTION_INFO_SUCCESS",
  "PAYMENTS_GET_PAYMENT_TRANSACTION_INFO_FAILURE"
)<{ transactionId: string }, TransactionInfo, NetworkError>();

export const paymentsDeleteTransactionAction = createAsyncAction(
  "PAYMENTS_DELETE_TRANSACTION_REQUEST",
  "PAYMENTS_DELETE_TRANSACTION_SUCCESS",
  "PAYMENTS_DELETE_TRANSACTION_FAILURE"
)<string, undefined, NetworkError>();

export type WalletPaymentAuthorizePayload = {
  transactionId: string;
  walletId: string;
  pspId: string;
  paymentAmount: AmountEuroCents;
  paymentFees: AmountEuroCents;
};

export const paymentsStartPaymentAuthorizationAction = createAsyncAction(
  "PAYMENTS_START_PAYMENT_AUTH_REQUEST",
  "PAYMENTS_START_PAYMENT_AUTH_SUCCESS",
  "PAYMENTS_START_PAYMENT_AUTH_FAILURE",
  "PAYMENTS_START_PAYMENT_AUTH_CANCEL"
)<
  WalletPaymentAuthorizePayload,
  RequestAuthorizationResponse,
  NetworkError,
  undefined
>();

export const paymentsResetPaymentPspList = createStandardAction(
  "PAYMENTS_RESET_PAYMENT_PSP_LIST"
)();

export type PaymentsPaymentNetworkingActions =
  | ActionType<typeof paymentsGetNewSessionTokenAction>
  | ActionType<typeof paymentsGetPaymentDetailsAction>
  | ActionType<typeof paymentsGetPaymentMethodsAction>
  | ActionType<typeof paymentsGetPaymentUserMethodsAction>
  | ActionType<typeof paymentsCalculatePaymentFeesAction>
  | ActionType<typeof paymentsCreateTransactionAction>
  | ActionType<typeof paymentsGetPaymentTransactionInfoAction>
  | ActionType<typeof paymentsDeleteTransactionAction>
  | ActionType<typeof paymentsStartPaymentAuthorizationAction>
  | ActionType<typeof paymentsResetPaymentPspList>;

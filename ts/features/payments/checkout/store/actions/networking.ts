import { ActionType, createAsyncAction } from "typesafe-actions";
import { AmountEuroCents } from "../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { CalculateFeeRequest } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeRequest";
import { CalculateFeeResponse } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { NewTransactionRequest } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionRequest";
import { NewTransactionResponse } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodsResponse";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RequestAuthorizationResponse } from "../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { PaymentMethodManagementTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodManagementType";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { TransactionInfo } from "../../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { Wallets } from "../../../../../../definitions/pagopa/ecommerce/Wallets";
import { NetworkError } from "../../../../../utils/errors";
import { WalletPaymentFailure } from "../../types/WalletPaymentFailure";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { UserLastPaymentMethodResponse } from "../../../../../../definitions/pagopa/ecommerce/UserLastPaymentMethodResponse";

type NotFound = { kind: "notFound" };

export const paymentsGetPaymentDetailsAction = createAsyncAction(
  "PAYMENTS_GET_PAYMENT_DETAILS_REQUEST",
  "PAYMENTS_GET_PAYMENT_DETAILS_SUCCESS",
  "PAYMENTS_GET_PAYMENT_DETAILS_FAILURE"
)<RptId, PaymentRequestsGetResponse, NetworkError | WalletPaymentFailure>();

type PaymentMethodsRequest = {
  amount?: number;
};

export const paymentsGetPaymentMethodsAction = createAsyncAction(
  "PAYMENTS_GET_PAYMENT_METHODS_REQUEST",
  "PAYMENTS_GET_PAYMENT_METHODS_SUCCESS",
  "PAYMENTS_GET_PAYMENT_METHODS_FAILURE"
)<PaymentMethodsRequest, PaymentMethodsResponse, NetworkError>();

type PaymentGetPaymentUserMethodsPayload = {
  onResponse?: (wallets: ReadonlyArray<WalletInfo> | undefined) => void;
};

export const paymentsGetPaymentUserMethodsAction = createAsyncAction(
  "PAYMENTS_GET_PAYMENT_USER_METHODS_REQUEST",
  "PAYMENTS_GET_PAYMENT_USER_METHODS_SUCCESS",
  "PAYMENTS_GET_PAYMENT_USER_METHODS_FAILURE"
)<PaymentGetPaymentUserMethodsPayload, Wallets, NetworkError>();

export const paymentsGetRecentPaymentMethodUsedAction = createAsyncAction(
  "PAYMENTS_GET_RECENT_PAYMENT_METHOD_REQUEST",
  "PAYMENTS_GET_RECENT_PAYMENT_METHOD_SUCCESS",
  "PAYMENTS_GET_RECENT_PAYMENT_METHOD_FAILURE"
)<undefined, UserLastPaymentMethodResponse, NetworkError>();

type CalculateFeePayload = {
  paymentMethodId: string;
  idPsp?: string;
};

export const paymentsCalculatePaymentFeesAction = createAsyncAction(
  "PAYMENTS_CALCULATE_PAYMENT_FEES_REQUEST",
  "PAYMENTS_CALCULATE_PAYMENT_FEES_SUCCESS",
  "PAYMENTS_CALCULATE_PAYMENT_FEES_FAILURE",
  "PAYMENTS_CALCULATE_PAYMENT_FEES_CANCEL"
)<
  CalculateFeeRequest & CalculateFeePayload,
  CalculateFeeResponse,
  NetworkError | NotFound,
  undefined
>();

export type WalletPaymentCreateTransactionPayload = {
  data: NewTransactionRequest;
  onError?: () => void;
};

export const paymentsCreateTransactionAction = createAsyncAction(
  "PAYMENTS_CREATE_TRANSACTION_REQUEST",
  "PAYMENTS_CREATE_TRANSACTION_SUCCESS",
  "PAYMENTS_CREATE_TRANSACTION_FAILURE"
)<
  WalletPaymentCreateTransactionPayload,
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
  walletId?: string;
  paymentMethodId: string;
  pspId: string;
  isAllCCP: boolean;
  paymentAmount: AmountEuroCents;
  paymentFees: AmountEuroCents;
  paymentMethodManagement?: PaymentMethodManagementTypeEnum;
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

export type PaymentsCheckoutNetworkingActions =
  | ActionType<typeof paymentsGetPaymentDetailsAction>
  | ActionType<typeof paymentsGetPaymentMethodsAction>
  | ActionType<typeof paymentsGetPaymentUserMethodsAction>
  | ActionType<typeof paymentsCalculatePaymentFeesAction>
  | ActionType<typeof paymentsCreateTransactionAction>
  | ActionType<typeof paymentsGetPaymentTransactionInfoAction>
  | ActionType<typeof paymentsDeleteTransactionAction>
  | ActionType<typeof paymentsGetRecentPaymentMethodUsedAction>
  | ActionType<typeof paymentsStartPaymentAuthorizationAction>;

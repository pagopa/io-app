import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { NetworkError } from "../../../../utils/errors";
import { NewTransactionRequest } from "../../../../../definitions/pagopa/ecommerce/NewTransactionRequest";
import { NewTransactionResponse } from "../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { CalculateFeeResponse } from "../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { CalculateFeeRequest } from "../../../../../definitions/pagopa/ecommerce/CalculateFeeRequest";
import { RequestAuthorizationRequest } from "../../../../../definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { RequestAuthorizationResponse } from "../../../../../definitions/pagopa/ecommerce/RequestAuthorizationResponse";

export type WalletInitializePaymentPayload = {
  entryPoint: string;
};

export const walletInitializePayment = createStandardAction(
  "WALLET_PAYMENT_INITIALIZATION"
)<WalletInitializePaymentPayload>();

export type WalletGetPaymentDetailsPayload = {
  rptId: RptId;
};

export const walletGetPaymentDetails = createAsyncAction(
  "WALLET_GET_PAYMENT_DETAILS_REQUEST",
  "WALLET_GET_PAYMENT_DETAILS_SUCCESS",
  "WALLET_GET_PAYMENT_DETAILS_FAILURE"
)<WalletGetPaymentDetailsPayload, PaymentRequestsGetResponse, NetworkError>();

export const walletCreateTransaction = createAsyncAction(
  "WALLET_CREATE_TRANSACTION_REQUEST",
  "WALLET_CREATE_TRANSACTION_SUCCESS",
  "WALLET_CREATE_TRANSACTION_FAILURE"
)<NewTransactionRequest, NewTransactionResponse, NetworkError>();

export type WalletGetPaymentFeesPayload = {
  walletId: RptId;
  request: CalculateFeeRequest;
};

export const walletGetPaymentFees = createAsyncAction(
  "WALLET_GET_PAYMET_FEES_REQUEST",
  "WALLET_GET_PAYMET_FEES_SUCCESS",
  "WALLET_GET_PAYMET_FEES_FAILURE"
)<WalletGetPaymentFeesPayload, CalculateFeeResponse, NetworkError>();

export type WalletAuthorizePaymentPayload = {
  transactionId: RptId;
  request: RequestAuthorizationRequest;
};

export const walletAuthorizePayment = createAsyncAction(
  "WALLET_PAYMENT_AUTH_REQUEST",
  "WALLET_PAYMENT_AUTH_SUCCESS",
  "WALLET_PAYMENT_AUTH_FAILURE"
)<WalletAuthorizePaymentPayload, RequestAuthorizationResponse, NetworkError>();

export type WalletPaymentActions =
  | ActionType<typeof walletInitializePayment>
  | ActionType<typeof walletGetPaymentDetails>
  | ActionType<typeof walletCreateTransaction>
  | ActionType<typeof walletGetPaymentFees>
  | ActionType<typeof walletAuthorizePayment>;

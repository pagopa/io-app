import { ActionType, createAsyncAction } from "typesafe-actions";
import { AmountEuroCents } from "../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { CalculateFeeResponse } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { NewTransactionRequest } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionRequest";
import { NewTransactionResponse } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RequestAuthorizationResponse } from "../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { NetworkError } from "../../../../../utils/errors";

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
  walletId: string;
  paymentAmount: AmountEuroCents;
};

export const walletGetPaymentFees = createAsyncAction(
  "WALLET_GET_PAYMET_FEES_REQUEST",
  "WALLET_GET_PAYMET_FEES_SUCCESS",
  "WALLET_GET_PAYMET_FEES_FAILURE"
)<WalletGetPaymentFeesPayload, CalculateFeeResponse, NetworkError>();

export type WalletAuthorizePaymentPayload = {
  transactionId: string;
  paymentAmount: AmountEuroCents;
  paymentFees: AmountEuroCents;
  pspId: string;
};

export const walletAuthorizePayment = createAsyncAction(
  "WALLET_PAYMENT_AUTH_REQUEST",
  "WALLET_PAYMENT_AUTH_SUCCESS",
  "WALLET_PAYMENT_AUTH_FAILURE"
)<WalletAuthorizePaymentPayload, RequestAuthorizationResponse, NetworkError>();

export type WalletPaymentActions =
  | ActionType<typeof walletGetPaymentDetails>
  | ActionType<typeof walletCreateTransaction>
  | ActionType<typeof walletGetPaymentFees>
  | ActionType<typeof walletAuthorizePayment>;

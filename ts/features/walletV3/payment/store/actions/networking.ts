import { ActionType, createAsyncAction } from "typesafe-actions";
import { AmountEuroCents } from "../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { CalculateFeeResponse } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { NewTransactionRequest } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionRequest";
import { NewTransactionResponse } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RequestAuthorizationResponse } from "../../../../../../definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";
import { Wallets } from "../../../../../../definitions/pagopa/walletv3/Wallets";
import { NetworkError } from "../../../../../utils/errors";
import { WalletPaymentFailure } from "../../types/failure";
import { CalculateFeeRequest } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeRequest";

export const walletPaymentGetDetails = createAsyncAction(
  "WALLET_PAYMENT_GET_DETAILS_REQUEST",
  "WALLET_PAYMENT_GET_DETAILS_SUCCESS",
  "WALLET_PAYMENT_GET_DETAILS_FAILURE"
)<RptId, PaymentRequestsGetResponse, NetworkError | WalletPaymentFailure>();

export const walletPaymentGetAllMethods = createAsyncAction(
  "WALLET_PAYMENT_GET_ALL_METHODS_REQUEST",
  "WALLET_PAYMENT_GET_ALL_METHODS_SUCCESS",
  "WALLET_PAYMENT_GET_ALL_METHODS_FAILURE"
)<undefined, PaymentMethodsResponse, NetworkError>();

export const walletPaymentGetUserWallets = createAsyncAction(
  "WALLET_PAYMENT_GET_USER_WALLETS_REQUEST",
  "WALLET_PAYMENT_GET_USER_WALLETS_SUCCESS",
  "WALLET_PAYMENT_GET_USER_WALLETS_FAILURE"
)<undefined, Wallets, NetworkError>();

export const walletPaymentCalculateFees = createAsyncAction(
  "WALLET_PAYMET_CALCULATE_FEES_REQUEST",
  "WALLET_PAYMET_CALCULATE_FEES_SUCCESS",
  "WALLET_PAYMET_CALCULATE_FEES_FAILURE"
)<
  CalculateFeeRequest & { paymentMethodId: string },
  CalculateFeeResponse,
  NetworkError
>();

export const walletPaymentCreateTransaction = createAsyncAction(
  "WALLET_PAYMENT_CREATE_TRANSACTION_REQUEST",
  "WALLET_PAYMENT_CREATE_TRANSACTION_SUCCESS",
  "WALLET_PAYMENT_CREATE_TRANSACTION_FAILURE"
)<
  NewTransactionRequest & { onSucces?: () => void },
  NewTransactionResponse,
  NetworkError | WalletPaymentFailure
>();

export const walletPaymentDeleteTransaction = createAsyncAction(
  "WALLET_PAYMENT_DELETE_TRANSACTION_REQUEST",
  "WALLET_PAYMENT_DELETE_TRANSACTION_SUCCESS",
  "WALLET_PAYMENT_DELETE_TRANSACTION_FAILURE"
)<string, undefined, NetworkError>();

export type WalletPaymentAuthorizePayload = {
  transactionId: string;
  walletId: string;
  pspId: string;
  paymentAmount: AmountEuroCents;
  paymentFees: AmountEuroCents;
};

export const walletPaymentAuthorization = createAsyncAction(
  "WALLET_PAYMENT_AUTH_REQUEST",
  "WALLET_PAYMENT_AUTH_SUCCESS",
  "WALLET_PAYMENT_AUTH_FAILURE",
  "WALLET_PAYMENT_AUTH_CANCEL"
)<
  WalletPaymentAuthorizePayload,
  RequestAuthorizationResponse,
  NetworkError,
  undefined
>();

export type WalletPaymentNetworkingActions =
  | ActionType<typeof walletPaymentGetDetails>
  | ActionType<typeof walletPaymentGetAllMethods>
  | ActionType<typeof walletPaymentGetUserWallets>
  | ActionType<typeof walletPaymentCalculateFees>
  | ActionType<typeof walletPaymentCreateTransaction>
  | ActionType<typeof walletPaymentDeleteTransaction>
  | ActionType<typeof walletPaymentAuthorization>;

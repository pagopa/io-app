import { ActionType, createAsyncAction } from "typesafe-actions";
import { WalletDTO } from "../../../../../../definitions/idpay/wallet/WalletDTO";
import { NetworkError } from "../../../../../utils/errors";
import { InitiativesWithInstrumentDTO as InitiativesFromInstrumentDTO } from "../../../../../../definitions/idpay/wallet/InitiativesWithInstrumentDTO";

export type IdPayInitiativesFromInstrumentPayloadType = {
  idWallet: string;
  isRefreshCall?: boolean;
};

export type IdpayInitiativesInstrumentEnrollPayloadType = {
  idWallet: string;
  initiativeId: string;
};

export type IdpayInitiativesInstrumentDeletePayloadType = {
  instrumentId: string;
  initiativeId: string;
};

type InitiativeId = { initiativeId: string };
type NetworkErrorWithInitiativeId = {
  error: NetworkError;
  initiativeId: string;
};

export const idPayWalletGet = createAsyncAction(
  "IDPAY_WALLET_REQUEST",
  "IDPAY_WALLET_SUCCESS",
  "IDPAY_WALLET_FAILURE"
)<void, WalletDTO, NetworkError>();

export const idPayInitiativesFromInstrumentGet = createAsyncAction(
  "IDPAY_INITIATIVES_FROM_INSTRUMENT_REQUEST",
  "IDPAY_INITIATIVES_FROM_INSTRUMENT_SUCCESS",
  "IDPAY_INITIATIVES_FROM_INSTRUMENT_FAILURE"
)<
  IdPayInitiativesFromInstrumentPayloadType,
  InitiativesFromInstrumentDTO,
  NetworkError
>();

export const idpayInitiativesInstrumentEnroll = createAsyncAction(
  "IDPAY_INITIATIVES_INSTRUMENT_ENROLL_REQUEST",
  "IDPAY_INITIATIVES_INSTRUMENT_ENROLL_SUCCESS",
  "IDPAY_INITIATIVES_INSTRUMENT_ENROLL_FAILURE"
)<
  IdpayInitiativesInstrumentEnrollPayloadType,
  InitiativeId,
  NetworkErrorWithInitiativeId
>();

export const idpayInitiativesInstrumentDelete = createAsyncAction(
  "IDPAY_INITIATIVES_INSTRUMENT_DELETE_REQUEST",
  "IDPAY_INITIATIVES_INSTRUMENT_DELETE_SUCCESS",
  "IDPAY_INITIATIVES_INSTRUMENT_DELETE_FAILURE"
)<
  IdpayInitiativesInstrumentDeletePayloadType,
  InitiativeId,
  NetworkErrorWithInitiativeId
>();

export type IDPayWalletActions =
  | ActionType<typeof idPayWalletGet>
  | ActionType<typeof idPayInitiativesFromInstrumentGet>
  | ActionType<typeof idpayInitiativesInstrumentEnroll>
  | ActionType<typeof idpayInitiativesInstrumentDelete>;

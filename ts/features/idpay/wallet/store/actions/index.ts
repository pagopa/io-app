import { ActionType, createAsyncAction } from "typesafe-actions";
import { WalletDTO } from "../../../../../../definitions/idpay/wallet/WalletDTO";
import { NetworkError } from "../../../../../utils/errors";
import { InitiativesWithInstrumentDTO } from "../../../../../../definitions/idpay/wallet/InitiativesWithInstrumentDTO";

export type IdpayWalletInitiativeGetPayloadType = {
  idWallet: string;
  isRefreshCall?: boolean;
};
export type IdpayInitiativesPairingPayloadType = {
  idWallet: string;
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

export const idPayWalletInitiativesGet = createAsyncAction(
  "IDPAY_WALLET_INITIATIVES_REQUEST",
  "IDPAY_WALLET_INITIATIVES_SUCCESS",
  "IDPAY_WALLET_INITIATIVES_FAILURE"
)<
  IdpayWalletInitiativeGetPayloadType,
  InitiativesWithInstrumentDTO,
  NetworkError
>();

export const idpayInitiativesPairingPut = createAsyncAction(
  "IDPAY_INITIATIVES_PAIRING_PUT_REQUEST",
  "IDPAY_INITIATIVES_PAIRING_PUT_SUCCESS",
  "IDPAY_INITIATIVES_PAIRING_PUT_FAILURE"
)<
  IdpayInitiativesPairingPayloadType,
  InitiativeId,
  NetworkErrorWithInitiativeId
>();

export const idpayInitiativesPairingDelete = createAsyncAction(
  "IDPAY_INITIATIVES_PAIRING_DELETE_REQUEST",
  "IDPAY_INITIATIVES_PAIRING_DELETE_SUCCESS",
  "IDPAY_INITIATIVES_PAIRING_DELETE_FAILURE"
)<
  IdpayInitiativesPairingPayloadType,
  InitiativeId,
  NetworkErrorWithInitiativeId
>();

export type IDPayWalletActions =
  | ActionType<typeof idPayWalletGet>
  | ActionType<typeof idPayWalletInitiativesGet>
  | ActionType<typeof idpayInitiativesPairingPut>
  | ActionType<typeof idpayInitiativesPairingDelete>;

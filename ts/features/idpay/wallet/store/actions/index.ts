import { ActionType, createAsyncAction } from "typesafe-actions";
import { WalletDTO } from "../../../../../../definitions/idpay/wallet/WalletDTO";
import { NetworkError } from "../../../../../utils/errors";
import { InitiativesWithInstrumentDTO } from "../../../../../../definitions/idpay/wallet/InitiativesWithInstrumentDTO";

export type IdpayWalletInitiativeGetPayloadType = {
  idWallet: string;
  isRefreshCall?: boolean;
};
export type IdpayInitiativesPairingPutPayloadType = {
  idWallet: string;
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
  IdpayInitiativesPairingPutPayloadType,
  { initiativeId: string },
  { error: NetworkError; initiativeId: string }
>();

export type IDPayWalletActions =
  | ActionType<typeof idPayWalletGet>
  | ActionType<typeof idPayWalletInitiativesGet>
  | ActionType<typeof idpayInitiativesPairingPut>;

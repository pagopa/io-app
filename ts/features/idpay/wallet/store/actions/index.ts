import { ActionType, createAsyncAction } from "typesafe-actions";
import { WalletDTO } from "../../../../../../definitions/idpay/wallet/WalletDTO";
import { NetworkError } from "../../../../../utils/errors";
import { InitiativesWithInstrumentDTO } from "../../../../../../definitions/idpay/wallet/InitiativesWithInstrumentDTO";

export const idPayWalletGet = createAsyncAction(
  "IDPAY_WALLET_REQUEST",
  "IDPAY_WALLET_SUCCESS",
  "IDPAY_WALLET_FAILURE"
)<void, WalletDTO, NetworkError>();

export type IdpayWalletInitiativeGetPayloadType = { idWallet: string };

export const idPayWalletInitiativesGet = createAsyncAction(
  "IDPAY_WALLET_INITIATIVES_REQUEST",
  "IDPAY_WALLET_INITIATIVES_SUCCESS",
  "IDPAY_WALLET_INITIATIVES_FAILURE"
)<
  IdpayWalletInitiativeGetPayloadType,
  InitiativesWithInstrumentDTO,
  NetworkError
>();

export type IDPayWalletActions =
  | ActionType<typeof idPayWalletGet>
  | ActionType<typeof idPayWalletInitiativesGet>;

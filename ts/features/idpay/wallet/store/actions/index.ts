import { ActionType, createAsyncAction } from "typesafe-actions";
import { WalletDTO } from "../../../../../../definitions/idpay/WalletDTO";
import { NetworkError } from "../../../../../utils/errors";

export const idPayWalletGet = createAsyncAction(
  "IDPAY_WALLET_REQUEST",
  "IDPAY_WALLET_SUCCESS",
  "IDPAY_WALLET_FAILURE"
)<void, WalletDTO, NetworkError>();

export type IDPayWalletActions = ActionType<typeof idPayWalletGet>;

import { ActionType, createAsyncAction } from "typesafe-actions";
import { ErrorDTO } from "../../../../../../definitions/idpay/wallet/ErrorDTO";
import { WalletDTO } from "../../../../../../definitions/idpay/wallet/WalletDTO";

export const idPayWalletGet = createAsyncAction(
  "IDPAY_WALLET_REQUEST",
  "IDPAY_WALLET_SUCCESS",
  "IDPAY_WALLET_FAILURE"
)<void, WalletDTO, ErrorDTO>();

export type IDPayWalletActions = ActionType<typeof idPayWalletGet>;

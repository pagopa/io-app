import { CitizenStatus } from "@io-app/api-types/generated/definitions/cdc/CitizenStatus";
import { ActionType, createAsyncAction } from "typesafe-actions";

import { NetworkError } from "../../../../../../utils/errors";

export const getCdcStatusWallet = createAsyncAction(
  "CDC_STATUS_WALLET_REQUEST",
  "CDC_STATUS_WALLET_SUCCESS",
  "CDC_STATUS_WALLET_FAILURE",
  "CDC_STATUS_WALLET_CANCEL"
)<void, CitizenStatus, NetworkError, void>();

export type CdcWalletActions = ActionType<typeof getCdcStatusWallet>;

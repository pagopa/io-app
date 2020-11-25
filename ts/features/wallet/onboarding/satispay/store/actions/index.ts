import { ActionType, createAsyncAction } from "typesafe-actions";
import { Satispay } from "../../../../../../../definitions/pagopa/walletv2/Satispay";
import { NetworkError } from "../../../../../../utils/errors";

/**
 * search for user's satispay
 */
export const searchUserSatispay = createAsyncAction(
  "WALLET_ONBOARDING_SATISPAY_LOAD_REQUEST",
  "WALLET_ONBOARDING_SATISPAY_LOAD_SUCCESS",
  "WALLET_ONBOARDING_SATISPAY_LOAD_FAILURE"
)<void, Satispay, NetworkError>();

export type SatispayActions = ActionType<typeof searchUserSatispay>;

import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../../utils/errors";
import { BPay } from "../../../../../../../definitions/pagopa/walletv2/BPay";

/**
 * Request the bancomat pay list for the user
 */
export const searchUserBPay = createAsyncAction(
  "WALLET_ONBOARDING_BPAY_LOAD_REQUEST",
  "WALLET_ONBOARDING_BPAY_LOAD_SUCCESS",
  "WALLET_ONBOARDING_BPAY_LOAD_FAILURE"
)<void, ReadonlyArray<BPay>, NetworkError>();

export type BPayActions = ActionType<typeof searchUserBPay>;

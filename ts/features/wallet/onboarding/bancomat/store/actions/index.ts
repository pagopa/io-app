import { ActionType, createAsyncAction } from "typesafe-actions";
import { AbiResponse } from "../../../../../../../definitions/pagopa/bancomat/AbiResponse";

/**
 * Request the list of all abi
 */
export const loadAbi = createAsyncAction(
  "WALLET_LOAD_ABI_REQUEST",
  "WALLET_LOAD_ABI_SUCCESS",
  "WALLET_LOAD_ABI_FAILURE"
)<void, AbiResponse, Error>();

export type AbiActions = ActionType<typeof loadAbi>;

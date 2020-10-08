import { ActionType, createAsyncAction } from "typesafe-actions";
import { AbiResponse } from "../../../../../../../definitions/pagopa/bancomat/AbiResponse";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";

/**
 * Request the list of all abi
 */
export const loadAbi = createAsyncAction(
  "WALLET_LOAD_ABI_REQUEST",
  "WALLET_LOAD_ABI_SUCCESS",
  "WALLET_LOAD_ABI_FAILURE"
)<void, AbiResponse, Error>();

/**
 * search for user's pans
 */
export const loadPans = createAsyncAction(
  "WALLET_LOAD_PANS_REQUEST",
  "WALLET_LOAD_PANS_SUCCESS",
  "WALLET_LOAD_PANS_FAILURE"
)<string | undefined, ReadonlyArray<PatchedCard>, Error>();

export type AbiActions =
  | ActionType<typeof loadAbi>
  | ActionType<typeof loadPans>;

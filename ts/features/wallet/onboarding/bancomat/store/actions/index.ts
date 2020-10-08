import { ActionType, createAsyncAction } from "typesafe-actions";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";
import { AbiListResponse } from "../../../../../../../definitions/pagopa/bancomat/AbiListResponse";

/**
 * Request the list of all abi
 */
export const loadAbi = createAsyncAction(
  "WALLET_LOAD_ABI_REQUEST",
  "WALLET_LOAD_ABI_SUCCESS",
  "WALLET_LOAD_ABI_FAILURE"
)<void, AbiListResponse, Error>();

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

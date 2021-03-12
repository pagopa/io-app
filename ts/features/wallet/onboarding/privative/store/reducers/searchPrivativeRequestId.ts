import { getType } from "typesafe-actions";
import { ExecutionStatusEnum } from "../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  PrivativeResponse,
  searchUserPrivative,
  walletAddPrivativeStart
} from "../actions";

export type SearchPrivativeRequestIdState = string | null;

/**
 * Return true if there is at least one request pending
 * @param privativeResponse
 * TODO: refactor with privative logic (only one logic, the same result)
 */
const isPrivativeResponsePending = (
  privativeResponse: PrivativeResponse
): boolean =>
  privativeResponse.searchRequestMetadata.some(
    s => s.executionStatus === ExecutionStatusEnum.PENDING
  );
const searchPrivativeRequestIdReducer = (
  state: SearchPrivativeRequestIdState = null,
  action: Action
): SearchPrivativeRequestIdState => {
  switch (action.type) {
    case getType(searchUserPrivative.success):
      // if response is pending then save the searchRequestId
      return isPrivativeResponsePending(action.payload)
        ? action.payload.searchRequestId ?? null
        : null;
    // reset at the start
    case getType(walletAddPrivativeStart):
      return null;
  }
  return state;
};

export const onboardingPrivativeSearchRequestId = (
  state: GlobalState
): string | undefined =>
  state.wallet.onboarding.privative.searchPrivativeRequestId ?? undefined;

export default searchPrivativeRequestIdReducer;

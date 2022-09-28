import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../../../../store/actions/types";
import { searchUserCoBadge, walletAddCoBadgeStart } from "../actions";
import { GlobalState } from "../../../../../../store/reducers/types";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { ExecutionStatusEnum } from "../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";

export type SearchCoBadgeRequestIdState = string | null;

/**
 * Return true if there is at least one request pending
 * @param cobadgeResponse
 */
const isCobadgeResponsePending = (cobadgeResponse: CobadgeResponse): boolean =>
  pipe(
    cobadgeResponse.payload,
    O.fromNullable,
    O.chainNullableK(p => p.searchRequestMetadata),
    O.map(sm =>
      sm.some(s => s.executionStatus === ExecutionStatusEnum.PENDING)
    ),
    O.getOrElse(() => false)
  );

const reducer = (
  state: SearchCoBadgeRequestIdState = null,
  action: Action
): SearchCoBadgeRequestIdState => {
  switch (action.type) {
    case getType(searchUserCoBadge.success):
      // if response is pending then save the searchRequestId
      return isCobadgeResponsePending(action.payload)
        ? action.payload?.payload?.searchRequestId ?? null
        : null;
    // reset at the start
    case getType(walletAddCoBadgeStart):
      return null;
  }
  return state;
};

export const onboardingCoBadgeSearchRequestId = (
  state: GlobalState
): string | undefined =>
  state.wallet.onboarding.coBadge.searchCoBadgeRequestId ?? undefined;

export default reducer;

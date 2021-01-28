import { getType } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";
import { Action } from "../../../../../../store/actions/types";
import { searchUserCoBadge, walletAddCoBadgeStart } from "../actions";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/cobadge/CobadgeResponse";
import { ExecutionStatusEnum } from "../../../../../../../definitions/pagopa/cobadge/SearchRequestMetadata";
import { GlobalState } from "../../../../../../store/reducers/types";

export type SearchCoBadgeRequestIdState = string | null;

// return true if every executionStatus in search request metadata is OK
const isCobadgeResponseComplete = (cobadgeResponse: CobadgeResponse): boolean =>
  fromNullable(cobadgeResponse.payload)
    .mapNullable(p => p.searchRequestMetadata)
    .map(sm => sm.every(s => s.executionStatus === ExecutionStatusEnum.OK))
    .getOrElse(false);

const reducer = (
  state: SearchCoBadgeRequestIdState = null,
  action: Action
): SearchCoBadgeRequestIdState => {
  switch (action.type) {
    case getType(searchUserCoBadge.success):
      // if response is complete then searchRequestId is useless
      return isCobadgeResponseComplete(action.payload)
        ? null
        : action.payload?.payload?.searchRequestId ?? null;
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

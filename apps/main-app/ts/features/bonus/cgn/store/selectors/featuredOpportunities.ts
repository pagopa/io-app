import { createSelector } from "reselect";

import { isReady } from "../../../../../common/model/RemoteValue";
import { cgnFeaturedOpportunitiesSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { ResolvedCgnFeaturedOpportunity } from "../actions/merchants";

const emptyOpportunities: ReadonlyArray<ResolvedCgnFeaturedOpportunity> = [];

export const resolvedCgnFeaturedOpportunitiesSelector = createSelector(
  (state: GlobalState) => state.bonus.cgn.featuredOpportunities,
  cgnFeaturedOpportunitiesSelector,
  (opportunities, references) =>
    isReady(opportunities)
      ? opportunities.value.filter(opportunity =>
          references.some(
            reference =>
              reference.merchantId === opportunity.merchant.id &&
              reference.discountId === opportunity.discount.id
          )
        )
      : emptyOpportunities
);

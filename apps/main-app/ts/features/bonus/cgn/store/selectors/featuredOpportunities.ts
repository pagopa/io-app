import { createSelector } from "reselect";

import { isLoading, isReady } from "../../../../../common/model/RemoteValue";
import { cgnFeaturedOpportunitiesSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { ResolvedCgnFeaturedOpportunity } from "../actions/merchants";

const emptyOpportunities: ReadonlyArray<ResolvedCgnFeaturedOpportunity> = [];

export const isLoadingFeaturedOpportunitiesSelector = (state: GlobalState) =>
  isLoading(state.bonus.cgn.featuredOpportunities);

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

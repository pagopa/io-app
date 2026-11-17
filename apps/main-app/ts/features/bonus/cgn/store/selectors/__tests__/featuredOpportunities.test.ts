import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../../../store/actions/backendStatus";
import { appReducer } from "../../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../../store/reducers/__mock__/backendStatus";
import * as appVersion from "../../../../../../utils/appVersion";
import { getGenericError } from "../../../../../../utils/errors";
import {
  cgnFeaturedOpportunities,
  ResolvedCgnFeaturedOpportunity
} from "../../actions/merchants";
import { resolvedCgnFeaturedOpportunitiesSelector } from "../featuredOpportunities";

const opportunity: ResolvedCgnFeaturedOpportunity = {
  merchant: {
    id: "merchant" as NonEmptyString,
    name: "Partner" as NonEmptyString,
    discounts: [],
    allNationalAddresses: false
  },
  discount: {
    id: "discount" as NonEmptyString,
    name: "Offer" as NonEmptyString,
    startDate: new Date("2020-01-01"),
    endDate: new Date("2099-12-31"),
    productCategories: []
  }
};
const references = [
  { merchantId: opportunity.merchant.id, discountId: opportunity.discount.id }
];

const makeConfig = (opportunities = references) => ({
  ...baseRawBackendStatus,
  config: {
    ...baseRawBackendStatus.config,
    cgn: {
      ...baseRawBackendStatus.config.cgn,
      featured_opportunities: {
        min_app_version: { ios: "1.0.0.0", android: "1.0.0.0" },
        opportunities
      }
    }
  }
});

const makeStore = () => {
  const store = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  store.dispatch(backendStatusLoadSuccess(makeConfig()));
  return store;
};

describe("resolvedCgnFeaturedOpportunitiesSelector", () => {
  beforeEach(() => {
    jest.spyOn(appVersion, "getAppVersion").mockReturnValue("99.0.0.0");
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns no cards until the details have been loaded", () => {
    const store = makeStore();
    expect(resolvedCgnFeaturedOpportunitiesSelector(store.getState())).toEqual(
      []
    );
    store.dispatch(cgnFeaturedOpportunities.request(references));
    expect(resolvedCgnFeaturedOpportunitiesSelector(store.getState())).toEqual(
      []
    );
  });

  it("returns the loaded opportunities without changing the selected merchant", () => {
    const store = makeStore();
    const selectedMerchant =
      store.getState().bonus.cgn.merchants.selectedMerchant;
    store.dispatch(cgnFeaturedOpportunities.success([opportunity]));
    expect(resolvedCgnFeaturedOpportunitiesSelector(store.getState())).toEqual([
      opportunity
    ]);
    expect(store.getState().bonus.cgn.merchants.selectedMerchant).toBe(
      selectedMerchant
    );
  });

  it("hides cached opportunities as soon as their configuration is removed", () => {
    const store = makeStore();
    store.dispatch(cgnFeaturedOpportunities.success([opportunity]));
    store.dispatch(backendStatusLoadSuccess(makeConfig([])));
    expect(resolvedCgnFeaturedOpportunitiesSelector(store.getState())).toEqual(
      []
    );
  });

  it("hides cached opportunities when the minimum version is no longer met", () => {
    const store = makeStore();
    store.dispatch(cgnFeaturedOpportunities.success([opportunity]));
    store.dispatch(
      backendStatusLoadSuccess({
        ...makeConfig(),
        config: {
          ...makeConfig().config,
          cgn: {
            ...makeConfig().config.cgn,
            featured_opportunities: {
              min_app_version: { ios: "999.0.0.0", android: "999.0.0.0" },
              opportunities: references
            }
          }
        }
      })
    );
    expect(resolvedCgnFeaturedOpportunitiesSelector(store.getState())).toEqual(
      []
    );
  });

  it("hides cards while reloading or after a failure", () => {
    const store = makeStore();
    store.dispatch(cgnFeaturedOpportunities.success([opportunity]));
    store.dispatch(cgnFeaturedOpportunities.request(references));
    expect(resolvedCgnFeaturedOpportunitiesSelector(store.getState())).toEqual(
      []
    );
    store.dispatch(
      cgnFeaturedOpportunities.failure(getGenericError(new Error("Offline")))
    );
    expect(resolvedCgnFeaturedOpportunitiesSelector(store.getState())).toEqual(
      []
    );
  });
});

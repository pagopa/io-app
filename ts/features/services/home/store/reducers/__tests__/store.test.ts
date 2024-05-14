import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action, createStore } from "redux";
import {
  featuredInstitutionsSelector,
  featuredServicesSelector,
  isErrorFeaturedInstitutionsSelector,
  isErrorFeaturedServicesSelector,
  isErrorPaginatedInstitutionsSelector,
  isLoadingFeaturedInstitutionsSelector,
  isLoadingFeaturedServicesSelector,
  isLoadingPaginatedInstitutionsSelector,
  isUpdatingFeaturedInstitutionsSelector,
  isUpdatingFeaturedServicesSelector,
  isUpdatingPaginatedInstitutionsSelector,
  paginatedInstitutionsCurrentPageSelector,
  paginatedInstitutionsLastPageSelector,
  paginatedInstitutionsSelector
} from "..";
import { FeaturedService } from "../../../../../../../definitions/services/FeaturedService";
import { FeaturedServices } from "../../../../../../../definitions/services/FeaturedServices";
import { InstitutionsResource } from "../../../../../../../definitions/services/InstitutionsResource";
import { OrganizationFiscalCode } from "../../../../../../../definitions/services/OrganizationFiscalCode";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import {
  featuredInstitutionsGet,
  featuredServicesGet,
  paginatedInstitutionsGet
} from "../../actions";

const MOCK_INSTITUTIONS: InstitutionsResource["institutions"] = [
  {
    fiscal_code: "FRLFNC82A04D969A" as OrganizationFiscalCode,
    id: "1",
    name: "Institution 1"
  },
  {
    fiscal_code: "FRLFNC82A04D969B" as OrganizationFiscalCode,
    id: "2",
    name: "Institution 2"
  },
  {
    fiscal_code: "FRLFNC82A04D969C" as OrganizationFiscalCode,
    id: "3",
    name: "Institution 3"
  }
];

const MOCK_FEATURED_SERVICES: FeaturedServices["services"] = [
  {
    id: "aServiceId1",
    name: "Service Name 1",
    version: 1
  } as FeaturedService,
  {
    id: "aServiceId2",
    name: "Service Name 2",
    version: 1
  } as FeaturedService,
  {
    id: "aServiceId3",
    name: "Service Name 3",
    version: 1,
    organization_name: "Organization Name"
  } as FeaturedService,
  {
    id: "aServiceId4",
    name: "Service Name 4",
    version: 1
  } as FeaturedService,
  {
    id: "aServiceId5",
    name: "Service Name 5",
    version: 1,
    organization_name: "Organization Name"
  } as FeaturedService
];

const MOCK_NETWORK_ERROR: NetworkError = {
  kind: "generic",
  value: new Error("response status code 500")
};

describe("Services home paginatedInstitutions reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.services.home.paginatedInstitutions).toStrictEqual(
      pot.none
    );
  });

  it("should handle paginatedInstitutionsGet action with zero offset", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(paginatedInstitutionsGet.request({ offset: 0, limit: 3 }));
    expect(
      store.getState().features.services.home.paginatedInstitutions
    ).toStrictEqual(pot.noneLoading);

    store.dispatch(
      paginatedInstitutionsGet.success({
        institutions: MOCK_INSTITUTIONS,
        count: 23,
        offset: 0,
        limit: 3
      })
    );
    expect(
      store.getState().features.services.home.paginatedInstitutions
    ).toStrictEqual(
      pot.some({
        institutions: MOCK_INSTITUTIONS,
        count: 23,
        offset: 0,
        limit: 3
      })
    );

    store.dispatch(paginatedInstitutionsGet.failure(MOCK_NETWORK_ERROR));
    expect(
      store.getState().features.services.home.paginatedInstitutions
    ).toStrictEqual(
      pot.someError(
        {
          institutions: MOCK_INSTITUTIONS,
          count: 23,
          offset: 0,
          limit: 3
        },
        MOCK_NETWORK_ERROR
      )
    );
  });

  it("should handle paginatedInstitutionsGet action with non-zero offset", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(
      paginatedInstitutionsGet.success({
        institutions: MOCK_INSTITUTIONS,
        count: 23,
        offset: 0,
        limit: 3
      })
    );

    store.dispatch(paginatedInstitutionsGet.request({ offset: 3, limit: 3 }));

    expect(
      store.getState().features.services.home.paginatedInstitutions
    ).toStrictEqual(
      pot.someUpdating(
        {
          institutions: MOCK_INSTITUTIONS,
          count: 23,
          offset: 0,
          limit: 3
        },
        {
          institutions: [],
          offset: 3,
          limit: 3,
          count: 0
        }
      )
    );

    store.dispatch(
      paginatedInstitutionsGet.success({
        institutions: MOCK_INSTITUTIONS,
        count: 23,
        offset: 3,
        limit: 3
      })
    );
    expect(
      store.getState().features.services.home.paginatedInstitutions
    ).toStrictEqual(
      pot.some({
        institutions: [...MOCK_INSTITUTIONS, ...MOCK_INSTITUTIONS],
        count: 23,
        offset: 3,
        limit: 3
      })
    );

    store.dispatch(paginatedInstitutionsGet.failure(MOCK_NETWORK_ERROR));
    expect(
      store.getState().features.services.home.paginatedInstitutions
    ).toStrictEqual(
      pot.someError(
        {
          institutions: [...MOCK_INSTITUTIONS, ...MOCK_INSTITUTIONS],
          count: 23,
          offset: 3,
          limit: 3
        },
        MOCK_NETWORK_ERROR
      )
    );
  });
});

describe("Services home paginatedInstitutions selectors", () => {
  describe("paginatedInstitutionsSelector", () => {
    it("should return the InstitutionsResource when pot.some", () => {
      const paginatedInstitutions = paginatedInstitutionsSelector(
        appReducer(
          {} as GlobalState,
          paginatedInstitutionsGet.success({
            institutions: MOCK_INSTITUTIONS,
            count: 23,
            offset: 0,
            limit: 3
          })
        )
      );
      expect(paginatedInstitutions).toStrictEqual({
        institutions: MOCK_INSTITUTIONS,
        count: 23,
        offset: 0,
        limit: 3
      });
    });

    it("should return undefined when not pot.some", () => {
      expect(
        paginatedInstitutionsSelector(appReducer(undefined, {} as Action))
      ).toBeUndefined();

      expect(
        paginatedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            paginatedInstitutionsGet.request({
              offset: 0,
              limit: 3
            })
          )
        )
      ).toBeUndefined();

      expect(
        paginatedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            paginatedInstitutionsGet.failure(MOCK_NETWORK_ERROR)
          )
        )
      ).toBeUndefined();
    });
  });

  describe("isLoadingPaginatedInstitutionsSelector", () => {
    it("should return true when pot.loading", () => {
      const isLoading = isLoadingPaginatedInstitutionsSelector(
        appReducer(
          {} as GlobalState,
          paginatedInstitutionsGet.request({ offset: 0, limit: 3 })
        )
      );
      expect(isLoading).toStrictEqual(true);
    });

    it("should return false when not pot.loading", () => {
      expect(
        isLoadingPaginatedInstitutionsSelector(
          appReducer(undefined, {} as Action)
        )
      ).toStrictEqual(false);

      expect(
        isLoadingPaginatedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            paginatedInstitutionsGet.success({
              institutions: MOCK_INSTITUTIONS,
              count: 23,
              offset: 0,
              limit: 3
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isUpdatingPaginatedInstitutionsSelector", () => {
    it("should return true when pot.updating", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(
        paginatedInstitutionsGet.success({
          institutions: MOCK_INSTITUTIONS,
          count: 23,
          offset: 0,
          limit: 3
        })
      );
      store.dispatch(paginatedInstitutionsGet.request({ offset: 3, limit: 3 }));

      const isUpdating = isUpdatingPaginatedInstitutionsSelector(
        store.getState()
      );

      expect(isUpdating).toStrictEqual(true);
    });

    it("should return false when not pot.updating", () => {
      expect(
        isUpdatingPaginatedInstitutionsSelector(
          appReducer(undefined, {} as Action)
        )
      ).toStrictEqual(false);

      expect(
        isUpdatingPaginatedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            paginatedInstitutionsGet.request({ offset: 0, limit: 3 })
          )
        )
      ).toStrictEqual(false);

      expect(
        isUpdatingPaginatedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            paginatedInstitutionsGet.success({
              institutions: MOCK_INSTITUTIONS,
              count: 23,
              offset: 0,
              limit: 3
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isErrorPaginatedInstitutionsSelector", () => {
    it("should return true when pot.error", () => {
      const isError = isErrorPaginatedInstitutionsSelector(
        appReducer(
          {} as GlobalState,
          paginatedInstitutionsGet.failure(MOCK_NETWORK_ERROR)
        )
      );
      expect(isError).toStrictEqual(true);
    });

    it("should return false when not pot.error", () => {
      expect(
        isErrorPaginatedInstitutionsSelector(
          appReducer(undefined, {} as Action)
        )
      ).toStrictEqual(false);

      expect(
        isErrorPaginatedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            paginatedInstitutionsGet.success({
              institutions: MOCK_INSTITUTIONS,
              count: 23,
              offset: 0,
              limit: 3
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("paginatedInstitutionsCurrentPageSelector", () => {
    [
      { expectedPage: 0, offset: 0, limit: 20, count: 55 },
      { expectedPage: 1, offset: 20, limit: 20, count: 55 },
      { expectedPage: 2, offset: 40, limit: 20, count: 55 },
      { expectedPage: -1, offset: 60, limit: 20, count: 55 }
    ].forEach(({ expectedPage, offset, limit, count }) => {
      it(`should return page "${expectedPage}" when offset is "${offset}", limit is "${limit}" and count is "${count}"`, () => {
        const currentPage = paginatedInstitutionsCurrentPageSelector(
          appReducer(
            {} as GlobalState,
            paginatedInstitutionsGet.success({
              institutions: MOCK_INSTITUTIONS,
              count,
              offset,
              limit
            })
          )
        );

        expect(currentPage).toStrictEqual(expectedPage);
      });
    });

    it(`should return page "0" when not pot.some`, () => {
      expect(
        paginatedInstitutionsCurrentPageSelector(
          appReducer(undefined, {} as Action)
        )
      ).toStrictEqual(0);
    });
  });

  describe("paginatedInstitutionsLastPageSelector", () => {
    [
      { isLastPage: false, offset: 0, limit: 20, count: 55 },
      { isLastPage: false, offset: 20, limit: 20, count: 55 },
      { isLastPage: true, offset: 40, limit: 20, count: 55 }
    ].forEach(({ isLastPage, offset, limit, count }) => {
      it(`should return isLastPage===${isLastPage} when offset is "${offset}", limit is "${limit}" and count is "${count}"`, () => {
        const lastPage = paginatedInstitutionsLastPageSelector(
          appReducer(
            {} as GlobalState,
            paginatedInstitutionsGet.success({
              institutions: MOCK_INSTITUTIONS,
              count,
              offset,
              limit
            })
          )
        );

        expect(lastPage).toStrictEqual(isLastPage);
      });
    });
  });
});

describe("Services home featuredInstitutions reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.services.home.featuredInstitutions).toStrictEqual(
      pot.none
    );
  });

  it("should handle featuredInstitutionsGet action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(featuredInstitutionsGet.request());
    expect(
      store.getState().features.services.home.featuredInstitutions
    ).toStrictEqual(pot.noneLoading);

    store.dispatch(
      featuredInstitutionsGet.success({
        institutions: MOCK_INSTITUTIONS
      })
    );
    expect(
      store.getState().features.services.home.featuredInstitutions
    ).toStrictEqual(
      pot.some({
        institutions: MOCK_INSTITUTIONS
      })
    );

    store.dispatch(featuredInstitutionsGet.failure(MOCK_NETWORK_ERROR));
    expect(
      store.getState().features.services.home.featuredInstitutions
    ).toStrictEqual(
      pot.someError(
        {
          institutions: MOCK_INSTITUTIONS
        },
        MOCK_NETWORK_ERROR
      )
    );
  });
});

describe("Services home featuredInstitutions selectors", () => {
  describe("featuredInstitutionsSelector", () => {
    it("should return FeaturedInstitutions when pot.some", () => {
      const featuredInstitutions = featuredInstitutionsSelector(
        appReducer(
          {} as GlobalState,
          featuredInstitutionsGet.success({
            institutions: MOCK_INSTITUTIONS
          })
        )
      );
      expect(featuredInstitutions).toStrictEqual({
        institutions: MOCK_INSTITUTIONS
      });
    });

    it("should return undefined when not pot.some", () => {
      expect(
        featuredInstitutionsSelector(appReducer(undefined, {} as Action))
      ).toBeUndefined();

      expect(
        featuredInstitutionsSelector(
          appReducer({} as GlobalState, featuredInstitutionsGet.request())
        )
      ).toBeUndefined();

      expect(
        featuredInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            featuredInstitutionsGet.failure(MOCK_NETWORK_ERROR)
          )
        )
      ).toBeUndefined();
    });
  });

  describe("isLoadingFeaturedInstitutionsSelector", () => {
    it("should return true when pot.loading", () => {
      const isLoading = isLoadingFeaturedInstitutionsSelector(
        appReducer({} as GlobalState, featuredInstitutionsGet.request())
      );
      expect(isLoading).toStrictEqual(true);
    });

    it("should return false when not pot.loading", () => {
      expect(
        isLoadingFeaturedInstitutionsSelector(
          appReducer(undefined, {} as Action)
        )
      ).toStrictEqual(false);

      expect(
        isLoadingFeaturedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            featuredInstitutionsGet.success({
              institutions: MOCK_INSTITUTIONS
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isUpdatingFeaturedInstitutionsSelector", () => {
    it("should return true when pot.updating", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(
        featuredInstitutionsGet.success({
          institutions: MOCK_INSTITUTIONS
        })
      );
      store.dispatch(featuredInstitutionsGet.request());

      const isUpdating = isUpdatingFeaturedInstitutionsSelector(
        store.getState()
      );

      expect(isUpdating).toStrictEqual(true);
    });

    it("should return false when not pot.updating", () => {
      expect(
        isUpdatingFeaturedInstitutionsSelector(
          appReducer(undefined, {} as Action)
        )
      ).toStrictEqual(false);

      expect(
        isUpdatingFeaturedInstitutionsSelector(
          appReducer({} as GlobalState, featuredInstitutionsGet.request())
        )
      ).toStrictEqual(false);

      expect(
        isUpdatingFeaturedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            featuredInstitutionsGet.success({
              institutions: MOCK_INSTITUTIONS
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isErrorFeaturedInstitutionsSelector", () => {
    it("should return true when pot.error", () => {
      const isError = isErrorFeaturedInstitutionsSelector(
        appReducer(
          {} as GlobalState,
          featuredInstitutionsGet.failure(MOCK_NETWORK_ERROR)
        )
      );
      expect(isError).toStrictEqual(true);
    });

    it("should return false when not pot.error", () => {
      expect(
        isErrorFeaturedInstitutionsSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual(false);

      expect(
        isErrorFeaturedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            featuredInstitutionsGet.success({
              institutions: MOCK_INSTITUTIONS
            })
          )
        )
      ).toStrictEqual(false);
    });
  });
});

describe("Services home featuredServices reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.services.home.featuredServices).toStrictEqual(
      pot.none
    );
  });

  it("should handle featuredServicesGet action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(featuredServicesGet.request());
    expect(
      store.getState().features.services.home.featuredServices
    ).toStrictEqual(pot.noneLoading);

    store.dispatch(
      featuredServicesGet.success({
        services: MOCK_FEATURED_SERVICES
      })
    );
    expect(
      store.getState().features.services.home.featuredServices
    ).toStrictEqual(
      pot.some({
        services: MOCK_FEATURED_SERVICES
      })
    );

    store.dispatch(featuredServicesGet.failure(MOCK_NETWORK_ERROR));
    expect(
      store.getState().features.services.home.featuredServices
    ).toStrictEqual(
      pot.someError(
        {
          services: MOCK_FEATURED_SERVICES
        },
        MOCK_NETWORK_ERROR
      )
    );
  });
});

describe("Services home featuredServices selectors", () => {
  describe("featuredServicesSelector", () => {
    it("should return FeaturedServices when pot.some", () => {
      const featuredServices = featuredServicesSelector(
        appReducer(
          {} as GlobalState,
          featuredServicesGet.success({
            services: MOCK_FEATURED_SERVICES
          })
        )
      );
      expect(featuredServices).toStrictEqual({
        services: MOCK_FEATURED_SERVICES
      });
    });

    it("should return undefined when not pot.some", () => {
      expect(
        featuredServicesSelector(appReducer(undefined, {} as Action))
      ).toBeUndefined();

      expect(
        featuredServicesSelector(
          appReducer({} as GlobalState, featuredServicesGet.request())
        )
      ).toBeUndefined();

      expect(
        featuredServicesSelector(
          appReducer(
            {} as GlobalState,
            featuredServicesGet.failure(MOCK_NETWORK_ERROR)
          )
        )
      ).toBeUndefined();
    });
  });

  describe("isLoadingFeaturedServicesSelector", () => {
    it("should return true when pot.loading", () => {
      const isLoading = isLoadingFeaturedServicesSelector(
        appReducer({} as GlobalState, featuredServicesGet.request())
      );
      expect(isLoading).toStrictEqual(true);
    });

    it("should return false when not pot.loading", () => {
      expect(
        isLoadingFeaturedServicesSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual(false);

      expect(
        isLoadingFeaturedServicesSelector(
          appReducer(
            {} as GlobalState,
            featuredServicesGet.success({
              services: MOCK_FEATURED_SERVICES
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isUpdatingFeaturedServicesSelector", () => {
    it("should return true when pot.updating", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(
        featuredServicesGet.success({
          services: MOCK_FEATURED_SERVICES
        })
      );
      store.dispatch(featuredServicesGet.request());

      const isUpdating = isUpdatingFeaturedServicesSelector(store.getState());

      expect(isUpdating).toStrictEqual(true);
    });

    it("should return false when not pot.updating", () => {
      expect(
        isUpdatingFeaturedServicesSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual(false);

      expect(
        isUpdatingFeaturedServicesSelector(
          appReducer({} as GlobalState, featuredServicesGet.request())
        )
      ).toStrictEqual(false);

      expect(
        isUpdatingFeaturedServicesSelector(
          appReducer(
            {} as GlobalState,
            featuredServicesGet.success({
              services: MOCK_FEATURED_SERVICES
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isErrorFeaturedServicesSelector", () => {
    it("should return true when pot.error", () => {
      const isError = isErrorFeaturedServicesSelector(
        appReducer(
          {} as GlobalState,
          featuredServicesGet.failure(MOCK_NETWORK_ERROR)
        )
      );
      expect(isError).toStrictEqual(true);
    });

    it("should return false when not pot.error", () => {
      expect(
        isErrorFeaturedServicesSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual(false);

      expect(
        isErrorFeaturedServicesSelector(
          appReducer(
            {} as GlobalState,
            featuredServicesGet.success({
              services: MOCK_FEATURED_SERVICES
            })
          )
        )
      ).toStrictEqual(false);
    });
  });
});

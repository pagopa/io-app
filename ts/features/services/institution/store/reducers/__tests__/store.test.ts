import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action, createStore } from "redux";
import {
  isErrorPaginatedServicesSelector,
  isLoadingPaginatedServicesSelector,
  isUpdatingPaginatedServicesSelector,
  paginatedServicesCurrentPageSelector,
  paginatedServicesLastPageSelector,
  paginatedServicesSelector
} from "..";
import { InstitutionServicesResource } from "../../../../../../../definitions/services/InstitutionServicesResource";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { paginatedServicesGet } from "../../actions";

const MOCK_INSTITUTION_ID = "1";

const MOCK_SERVICES: InstitutionServicesResource["services"] = [
  {
    id: "1",
    name: "Service 1",
    version: 1
  },
  {
    id: "2",
    name: "Service 2",
    version: 1
  },
  {
    id: "3",
    name: "Service 3",
    version: 1
  }
];

const MOCK_NETWORK_ERROR: NetworkError = {
  kind: "generic",
  value: new Error("response status code 500")
};

describe("Institution paginatedServices reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.services.institution.paginatedServices).toStrictEqual(
      pot.none
    );
  });

  it("should handle paginatedServicesGet action with zero offset", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(
      paginatedServicesGet.request({
        institutionId: MOCK_INSTITUTION_ID,
        offset: 0,
        limit: 3
      })
    );
    expect(
      store.getState().features.services.institution.paginatedServices
    ).toStrictEqual(pot.noneLoading);

    store.dispatch(
      paginatedServicesGet.success({
        services: MOCK_SERVICES,
        count: 23,
        offset: 0,
        limit: 3
      })
    );
    expect(
      store.getState().features.services.institution.paginatedServices
    ).toStrictEqual(
      pot.some({
        services: MOCK_SERVICES,
        count: 23,
        offset: 0,
        limit: 3
      })
    );

    store.dispatch(paginatedServicesGet.failure(MOCK_NETWORK_ERROR));
    expect(
      store.getState().features.services.institution.paginatedServices
    ).toStrictEqual(
      pot.someError(
        {
          services: MOCK_SERVICES,
          count: 23,
          offset: 0,
          limit: 3
        },
        MOCK_NETWORK_ERROR
      )
    );
  });

  it("should handle paginatedServicesGet action with non-zero offset", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(
      paginatedServicesGet.success({
        services: MOCK_SERVICES,
        count: 23,
        offset: 0,
        limit: 3
      })
    );

    store.dispatch(
      paginatedServicesGet.request({
        institutionId: MOCK_INSTITUTION_ID,
        offset: 3,
        limit: 3
      })
    );

    expect(
      store.getState().features.services.institution.paginatedServices
    ).toStrictEqual(
      pot.someUpdating(
        {
          services: MOCK_SERVICES,
          count: 23,
          offset: 0,
          limit: 3
        },
        {
          services: [],
          offset: 3,
          limit: 3,
          count: 0
        }
      )
    );

    store.dispatch(
      paginatedServicesGet.success({
        services: MOCK_SERVICES,
        count: 23,
        offset: 3,
        limit: 3
      })
    );
    expect(
      store.getState().features.services.institution.paginatedServices
    ).toStrictEqual(
      pot.some({
        services: [...MOCK_SERVICES, ...MOCK_SERVICES],
        count: 23,
        offset: 3,
        limit: 3
      })
    );

    store.dispatch(paginatedServicesGet.failure(MOCK_NETWORK_ERROR));
    expect(
      store.getState().features.services.institution.paginatedServices
    ).toStrictEqual(
      pot.someError(
        {
          services: [...MOCK_SERVICES, ...MOCK_SERVICES],
          count: 23,
          offset: 3,
          limit: 3
        },
        MOCK_NETWORK_ERROR
      )
    );
  });

  it("should handle paginatedServicesGet.cancel action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(
      paginatedServicesGet.success({
        services: MOCK_SERVICES,
        count: 23,
        offset: 0,
        limit: 3
      })
    );

    store.dispatch(paginatedServicesGet.cancel());

    expect(
      store.getState().features.services.institution.paginatedServices
    ).toStrictEqual(pot.none);
  });
});

describe("Institution paginatedServices selectors", () => {
  describe("paginatedServicesSelector", () => {
    it("should return the InstitutionServicesResource when pot.some", () => {
      const paginatedInstitutions = paginatedServicesSelector(
        appReducer(
          {} as GlobalState,
          paginatedServicesGet.success({
            services: MOCK_SERVICES,
            count: 23,
            offset: 0,
            limit: 3
          })
        )
      );
      expect(paginatedInstitutions).toStrictEqual({
        services: MOCK_SERVICES,
        count: 23,
        offset: 0,
        limit: 3
      });
    });

    it("should return undefined when not pot.some", () => {
      expect(
        paginatedServicesSelector(appReducer(undefined, {} as Action))
      ).toBeUndefined();

      expect(
        paginatedServicesSelector(
          appReducer(
            {} as GlobalState,
            paginatedServicesGet.request({
              institutionId: MOCK_INSTITUTION_ID,
              offset: 0,
              limit: 3
            })
          )
        )
      ).toBeUndefined();

      expect(
        paginatedServicesSelector(
          appReducer(
            {} as GlobalState,
            paginatedServicesGet.failure(MOCK_NETWORK_ERROR)
          )
        )
      ).toBeUndefined();
    });
  });

  describe("isLoadingPaginatedServicesSelector", () => {
    it("should return true when pot.loading", () => {
      const isLoading = isLoadingPaginatedServicesSelector(
        appReducer(
          {} as GlobalState,
          paginatedServicesGet.request({
            institutionId: MOCK_INSTITUTION_ID,
            offset: 0,
            limit: 3
          })
        )
      );
      expect(isLoading).toStrictEqual(true);
    });

    it("should return false when not pot.loading", () => {
      expect(
        isLoadingPaginatedServicesSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual(false);

      expect(
        isLoadingPaginatedServicesSelector(
          appReducer(
            {} as GlobalState,
            paginatedServicesGet.success({
              services: MOCK_SERVICES,
              count: 23,
              offset: 0,
              limit: 3
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isUpdatingPaginatedServicesSelector", () => {
    it("should return true when pot.updating", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(
        paginatedServicesGet.success({
          services: MOCK_SERVICES,
          count: 23,
          offset: 0,
          limit: 3
        })
      );
      store.dispatch(
        paginatedServicesGet.request({
          institutionId: MOCK_INSTITUTION_ID,
          offset: 3,
          limit: 3
        })
      );

      const isUpdating = isUpdatingPaginatedServicesSelector(store.getState());

      expect(isUpdating).toStrictEqual(true);
    });

    it("should return false when not pot.updating", () => {
      expect(
        isUpdatingPaginatedServicesSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual(false);

      expect(
        isUpdatingPaginatedServicesSelector(
          appReducer(
            {} as GlobalState,
            paginatedServicesGet.request({
              institutionId: MOCK_INSTITUTION_ID,
              offset: 0,
              limit: 3
            })
          )
        )
      ).toStrictEqual(false);

      expect(
        isUpdatingPaginatedServicesSelector(
          appReducer(
            {} as GlobalState,
            paginatedServicesGet.success({
              services: MOCK_SERVICES,
              count: 23,
              offset: 0,
              limit: 3
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isErrorPaginatedServicesSelector", () => {
    it("should return true when pot.error", () => {
      const isError = isErrorPaginatedServicesSelector(
        appReducer(
          {} as GlobalState,
          paginatedServicesGet.failure(MOCK_NETWORK_ERROR)
        )
      );
      expect(isError).toStrictEqual(true);
    });

    it("should return false when not pot.error", () => {
      expect(
        isErrorPaginatedServicesSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual(false);

      expect(
        isErrorPaginatedServicesSelector(
          appReducer(
            {} as GlobalState,
            paginatedServicesGet.success({
              services: MOCK_SERVICES,
              count: 23,
              offset: 0,
              limit: 3
            })
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("paginatedServicesCurrentPageSelector", () => {
    [
      { expectedPage: 0, offset: 0, limit: 20, count: 55 },
      { expectedPage: 1, offset: 20, limit: 20, count: 55 },
      { expectedPage: 2, offset: 40, limit: 20, count: 55 },
      { expectedPage: -1, offset: 60, limit: 20, count: 55 }
    ].forEach(({ expectedPage, offset, limit, count }) => {
      it(`should return page "${expectedPage}" when offset is "${offset}", limit is "${limit}" and count is "${count}"`, () => {
        const currentPage = paginatedServicesCurrentPageSelector(
          appReducer(
            {} as GlobalState,
            paginatedServicesGet.success({
              services: MOCK_SERVICES,
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
        paginatedServicesCurrentPageSelector(
          appReducer(undefined, {} as Action)
        )
      ).toStrictEqual(0);
    });
  });

  describe("paginatedServicesLastPageSelector", () => {
    [
      { isLastPage: false, offset: 0, limit: 20, count: 55 },
      { isLastPage: false, offset: 20, limit: 20, count: 55 },
      { isLastPage: true, offset: 40, limit: 20, count: 55 }
    ].forEach(({ isLastPage, offset, limit, count }) => {
      it(`should return isLastPage===${isLastPage} when offset is "${offset}", limit is "${limit}" and count is "${count}"`, () => {
        const lastPage = paginatedServicesLastPageSelector(
          appReducer(
            {} as GlobalState,
            paginatedServicesGet.success({
              services: MOCK_SERVICES,
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

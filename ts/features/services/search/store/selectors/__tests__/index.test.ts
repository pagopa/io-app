import { Action, createStore } from "redux";
import {
  isErrorPaginatedInstitutionsSelector,
  isLoadingPaginatedInstitutionsSelector,
  isUpdatingPaginatedInstitutionsSelector,
  paginatedInstitutionsCurrentPageSelector,
  paginatedInstitutionsLastPageSelector,
  paginatedInstitutionsSelector
} from "..";
import { InstitutionsResource } from "../../../../../../../definitions/services/InstitutionsResource";
import { OrganizationFiscalCode } from "../../../../../../../definitions/services/OrganizationFiscalCode";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { searchPaginatedInstitutionsGet } from "../../actions";

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

const MOCK_NETWORK_ERROR: NetworkError = {
  kind: "generic",
  value: new Error("response status code 500")
};

describe("Services search paginatedInstitutions selectors", () => {
  describe("paginatedInstitutionsSelector", () => {
    it("should return the InstitutionsResource when pot.some", () => {
      const paginatedInstitutions = paginatedInstitutionsSelector(
        appReducer(
          {} as GlobalState,
          searchPaginatedInstitutionsGet.success({
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
            searchPaginatedInstitutionsGet.request({
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
            searchPaginatedInstitutionsGet.failure(MOCK_NETWORK_ERROR)
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
          searchPaginatedInstitutionsGet.request({ offset: 0, limit: 3 })
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
            searchPaginatedInstitutionsGet.success({
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
        searchPaginatedInstitutionsGet.success({
          institutions: MOCK_INSTITUTIONS,
          count: 23,
          offset: 0,
          limit: 3
        })
      );
      store.dispatch(
        searchPaginatedInstitutionsGet.request({ offset: 3, limit: 3 })
      );

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
            searchPaginatedInstitutionsGet.request({ offset: 0, limit: 3 })
          )
        )
      ).toStrictEqual(false);

      expect(
        isUpdatingPaginatedInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            searchPaginatedInstitutionsGet.success({
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
          searchPaginatedInstitutionsGet.failure(MOCK_NETWORK_ERROR)
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
            searchPaginatedInstitutionsGet.success({
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
            searchPaginatedInstitutionsGet.success({
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
            searchPaginatedInstitutionsGet.success({
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

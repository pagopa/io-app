import MockDate from "mockdate";
import { Action } from "redux";
import {
  featuredInstitutionsSelector,
  featuredServicesSelector,
  isErrorFeaturedInstitutionsSelector,
  isErrorFeaturedServicesSelector,
  isLoadingFeaturedInstitutionsSelector,
  isLoadingFeaturedServicesSelector,
  paginatedInstitutionsCurrentPageSelector,
  paginatedInstitutionsLastPageSelector,
  paginatedInstitutionsSelector
} from "..";
import { FeaturedService } from "../../../../../../../definitions/services/FeaturedService";
import { FeaturedServices } from "../../../../../../../definitions/services/FeaturedServices";
import { InstitutionsResource } from "../../../../../../../definitions/services/InstitutionsResource";
import { OrganizationFiscalCode } from "../../../../../../../definitions/services/OrganizationFiscalCode";
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

const MOCKED_DATE = new Date();
MockDate.set(MOCKED_DATE);

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
      expect(featuredInstitutions).toStrictEqual(MOCK_INSTITUTIONS);
    });

    it("should return undefined when not pot.some", () => {
      expect(
        featuredInstitutionsSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual([]);

      expect(
        featuredInstitutionsSelector(
          appReducer({} as GlobalState, featuredInstitutionsGet.request())
        )
      ).toStrictEqual([]);

      expect(
        featuredInstitutionsSelector(
          appReducer(
            {} as GlobalState,
            featuredInstitutionsGet.failure(MOCK_NETWORK_ERROR)
          )
        )
      ).toStrictEqual([]);
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
      expect(featuredServices).toStrictEqual(MOCK_FEATURED_SERVICES);
    });

    it("should return undefined when not pot.some", () => {
      expect(
        featuredServicesSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual([]);

      expect(
        featuredServicesSelector(
          appReducer({} as GlobalState, featuredServicesGet.request())
        )
      ).toStrictEqual([]);

      expect(
        featuredServicesSelector(
          appReducer(
            {} as GlobalState,
            featuredServicesGet.failure(MOCK_NETWORK_ERROR)
          )
        )
      ).toStrictEqual([]);
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

import * as pot from "@pagopa/ts-commons/lib/pot";
import MockDate from "mockdate";
import { createStore } from "redux";
import { FeaturedService } from "../../../../../../../definitions/services/FeaturedService";
import { FeaturedServices } from "../../../../../../../definitions/services/FeaturedServices";
import { InstitutionsResource } from "../../../../../../../definitions/services/InstitutionsResource";
import { OrganizationFiscalCode } from "../../../../../../../definitions/services/OrganizationFiscalCode";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
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
        {
          reason: MOCK_NETWORK_ERROR,
          time: MOCKED_DATE
        }
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
        {
          reason: MOCK_NETWORK_ERROR,
          time: MOCKED_DATE
        }
      )
    );
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

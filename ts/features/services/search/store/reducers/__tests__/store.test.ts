import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { InstitutionsResource } from "../../../../../../../definitions/services/InstitutionsResource";
import { OrganizationFiscalCode } from "../../../../../../../definitions/services/OrganizationFiscalCode";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
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

describe("Services search paginatedInstitutions reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.services.search.paginatedInstitutions).toStrictEqual(
      pot.none
    );
  });

  it("should handle searchPaginatedInstitutionsGet action with zero offset", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(
      searchPaginatedInstitutionsGet.request({ offset: 0, limit: 3 })
    );
    expect(
      store.getState().features.services.search.paginatedInstitutions
    ).toStrictEqual(pot.noneLoading);

    store.dispatch(
      searchPaginatedInstitutionsGet.success({
        institutions: MOCK_INSTITUTIONS,
        count: 23,
        offset: 0,
        limit: 3
      })
    );
    expect(
      store.getState().features.services.search.paginatedInstitutions
    ).toStrictEqual(
      pot.some({
        institutions: MOCK_INSTITUTIONS,
        count: 23,
        offset: 0,
        limit: 3
      })
    );

    store.dispatch(searchPaginatedInstitutionsGet.failure(MOCK_NETWORK_ERROR));
    expect(
      store.getState().features.services.search.paginatedInstitutions
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

  it("should handle searchPaginatedInstitutionsGet action with non-zero offset", () => {
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

    expect(
      store.getState().features.services.search.paginatedInstitutions
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
      searchPaginatedInstitutionsGet.success({
        institutions: MOCK_INSTITUTIONS,
        count: 23,
        offset: 3,
        limit: 3
      })
    );
    expect(
      store.getState().features.services.search.paginatedInstitutions
    ).toStrictEqual(
      pot.some({
        institutions: [...MOCK_INSTITUTIONS, ...MOCK_INSTITUTIONS],
        count: 23,
        offset: 3,
        limit: 3
      })
    );

    store.dispatch(searchPaginatedInstitutionsGet.failure(MOCK_NETWORK_ERROR));
    expect(
      store.getState().features.services.search.paginatedInstitutions
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

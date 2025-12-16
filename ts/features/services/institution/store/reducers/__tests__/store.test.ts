import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { InstitutionServicesResource } from "../../../../../../../definitions/services/InstitutionServicesResource";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { NetworkError } from "../../../../../../utils/errors";
import { WithInstitutionID, paginatedServicesGet } from "../../actions";
import { ServiceId } from "../../../../../../../definitions/services/ServiceId";

const MOCK_INSTITUTION_ID = "1";

const MOCK_SERVICES: InstitutionServicesResource["services"] = [
  {
    id: "1" as ServiceId,
    name: "Service 1",
    version: 1
  },
  {
    id: "2" as ServiceId,
    name: "Service 2",
    version: 1
  },
  {
    id: "3" as ServiceId,
    name: "Service 3",
    version: 1
  }
];

const MOCK_NETWORK_ERROR: WithInstitutionID<NetworkError> = {
  id: MOCK_INSTITUTION_ID,
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

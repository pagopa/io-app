import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { ServiceId } from "../../../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { getNetworkError } from "../../../../../../utils/errors";
import {
  getFavouriteService,
  toggleFavouriteService
} from "../../actions/favourite";

const serviceId = "serviceId" as ServiceId;
const serviceId2 = "serviceId2" as ServiceId;

const getFavouriteServiceError = (id = serviceId) => ({
  id,
  error: getNetworkError(new Error("GenericError"))
});

describe("favouritesById reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    expect(state.features.services.details.favouritesById).toStrictEqual({});
  });

  it("should handle getFavouriteService action, both failure and success for a single service", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(getFavouriteService.request(serviceId));

    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.noneLoading
    });

    store.dispatch(getFavouriteService.success(serviceId));
    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.some(true)
    });

    store.dispatch(getFavouriteService.failure(getFavouriteServiceError()));
    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.someError(false, getFavouriteServiceError())
    });
  });

  it("should handle getFavouriteService actions for multiple services", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    // Load service 1
    store.dispatch(getFavouriteService.request(serviceId));
    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.noneLoading
    });

    // Load service 2
    store.dispatch(getFavouriteService.request(serviceId2));
    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.noneLoading,
      [serviceId2]: pot.noneLoading
    });

    // Service 1 succeeds
    store.dispatch(getFavouriteService.success(serviceId));
    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.some(true),
      [serviceId2]: pot.noneLoading
    });

    // Service 2 fails
    store.dispatch(
      getFavouriteService.failure(getFavouriteServiceError(serviceId2))
    );
    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.some(true),
      [serviceId2]: pot.someError(false, getFavouriteServiceError(serviceId2))
    });

    // Service 2 is retried and succeeds
    store.dispatch(getFavouriteService.request(serviceId2));
    store.dispatch(getFavouriteService.success(serviceId2));
    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.some(true),
      [serviceId2]: pot.some(true)
    });
  });

  it("should handle mixed getFavouriteService and toggleFavouriteService actions for multiple services", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(getFavouriteService.success(serviceId));
    store.dispatch(getFavouriteService.success(serviceId2));

    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.some(true),
      [serviceId2]: pot.some(true)
    });

    // Update service 1
    store.dispatch(
      toggleFavouriteService.request({ id: serviceId, isFavourite: false })
    );

    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.someUpdating(false, false),
      [serviceId2]: pot.some(true)
    });

    // Service 1 update fails
    store.dispatch(
      toggleFavouriteService.failure({
        ...getFavouriteServiceError(),
        isFavourite: true
      })
    );

    // Update service 2
    store.dispatch(
      toggleFavouriteService.request({ id: serviceId2, isFavourite: false })
    );

    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.some(true),
      [serviceId2]: pot.someUpdating(false, false)
    });

    // Service 2 update succeeds
    store.dispatch(
      toggleFavouriteService.success({ id: serviceId2, isFavourite: false })
    );

    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.some(true),
      [serviceId2]: pot.some(false)
    });
  });

  it("should handle a failing upsertServicePreference action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    const finalState: GlobalState = {
      ...state,
      features: {
        ...state.features,
        services: {
          ...state.features.services,
          details: {
            ...state.features.services.details,
            favouritesById: {
              [serviceId]: pot.some(true)
            }
          }
        }
      }
    };
    const store = createStore(appReducer, finalState as any);

    store.dispatch(
      toggleFavouriteService.request({ id: serviceId, isFavourite: false })
    );

    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.someUpdating(false, false)
    });

    store.dispatch(
      toggleFavouriteService.failure({
        ...getFavouriteServiceError(),
        isFavourite: true
      })
    );
    expect(
      store.getState().features.services.details.favouritesById
    ).toStrictEqual({
      [serviceId]: pot.some(true)
    });
  });
});

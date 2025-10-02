import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { ServiceId } from "../../../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError, getNetworkError } from "../../../../../../utils/errors";
import {
  ServicePreference,
  ServicePreferenceResponse,
  WithServiceID
} from "../../../types/ServicePreferenceResponse";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../actions/preference";

const serviceId = "serviceId" as ServiceId;
const serviceId2 = "serviceId2" as ServiceId;

const getServicePreferenceResponseSuccess = (id = serviceId) =>
  ({
    id,
    kind: "success",
    value: {
      inbox: true,
      push: true,
      email: false,
      can_access_message_read_status: false,
      settings_version: 0
    }
  } as ServicePreferenceResponse);

const getServicePreferenceError = (id = serviceId) =>
  ({
    id,
    ...getNetworkError(new Error("GenericError"))
  } as WithServiceID<NetworkError>);

const getUpdatingResponse = (id = serviceId) =>
  ({
    id,
    inbox: true,
    push: true,
    email: true,
    can_access_message_read_status: true,
    settings_version: 0
  } as WithServiceID<ServicePreference>);

describe("preferencesById reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    expect(state.features.services.details.preferencesById).toStrictEqual({});
  });

  it("should handle loadServicePreference action, both failure and success for a single service", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    const preference = getServicePreferenceResponseSuccess();

    store.dispatch(loadServicePreference.request(serviceId));

    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.noneLoading
    });

    store.dispatch(loadServicePreference.success(preference));
    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.some(preference)
    });

    store.dispatch(loadServicePreference.failure(getServicePreferenceError()));
    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.someError(preference, getServicePreferenceError())
    });
  });

  it("should handle loadServicePreference actions for multiple services", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    // Load service 1
    store.dispatch(loadServicePreference.request(serviceId));
    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.noneLoading
    });

    // Load service 2
    store.dispatch(loadServicePreference.request(serviceId2));
    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.noneLoading,
      [serviceId2]: pot.noneLoading
    });

    // Service 1 succeeds
    const preference1 = getServicePreferenceResponseSuccess(serviceId);
    store.dispatch(loadServicePreference.success(preference1));
    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.some(preference1),
      [serviceId2]: pot.noneLoading
    });

    // Service 2 fails
    store.dispatch(
      loadServicePreference.failure(getServicePreferenceError(serviceId2))
    );
    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.some(preference1),
      [serviceId2]: pot.noneError(getServicePreferenceError(serviceId2))
    });

    // Service 2 is retried and succeeds
    const preference2 = getServicePreferenceResponseSuccess(serviceId2);
    store.dispatch(loadServicePreference.request(serviceId2));
    store.dispatch(loadServicePreference.success(preference2));
    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.some(preference1),
      [serviceId2]: pot.some(preference2)
    });
  });

  it("should handle mixed loadServicePreference and upsertServicePreference actions for multiple services", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    // Load both services
    const preference1 = getServicePreferenceResponseSuccess(serviceId);
    const preference2 = getServicePreferenceResponseSuccess(serviceId2);

    store.dispatch(loadServicePreference.success(preference1));
    store.dispatch(loadServicePreference.success(preference2));

    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.some(preference1),
      [serviceId2]: pot.some(preference2)
    });

    // Update service 1
    const updatingResponse1 = getUpdatingResponse(serviceId);
    store.dispatch(upsertServicePreference.request(updatingResponse1));

    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.someUpdating(preference1, {
        id: serviceId,
        kind: "success",
        value: {
          inbox: true,
          push: true,
          email: true,
          can_access_message_read_status: true,
          settings_version: 0
        }
      }),
      [serviceId2]: pot.some(preference2)
    });

    // Service 1 update fails
    store.dispatch(
      upsertServicePreference.failure(getServicePreferenceError(serviceId))
    );

    // Update service 2
    const updatingResponse2 = getUpdatingResponse(serviceId2);
    store.dispatch(upsertServicePreference.request(updatingResponse2));

    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.someError(
        preference1,
        getServicePreferenceError(serviceId)
      ),
      [serviceId2]: pot.someUpdating(preference2, {
        id: serviceId2,
        kind: "success",
        value: {
          inbox: true,
          push: true,
          email: true,
          can_access_message_read_status: true,
          settings_version: 0
        }
      })
    });

    // Service 2 update succeeds
    const updatedPreference2 = {
      id: serviceId2,
      kind: "success",
      value: {
        inbox: true,
        push: true,
        email: true,
        can_access_message_read_status: true,
        settings_version: 0
      }
    } as ServicePreferenceResponse;

    store.dispatch(upsertServicePreference.success(updatedPreference2));

    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.someError(
        preference1,
        getServicePreferenceError(serviceId)
      ),
      [serviceId2]: pot.some(updatedPreference2)
    });
  });

  it("should handle a failing upsertServicePreference action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    const preference = getServicePreferenceResponseSuccess();

    const finalState: GlobalState = {
      ...state,
      features: {
        ...state.features,
        services: {
          ...state.features.services,
          details: {
            ...state.features.services.details,
            preferencesById: {
              [serviceId]: pot.some(preference)
            }
          }
        }
      }
    };
    const store = createStore(appReducer, finalState as any);

    store.dispatch(upsertServicePreference.request(getUpdatingResponse()));

    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.someUpdating(preference, {
        id: serviceId,
        kind: "success",
        value: {
          inbox: true,
          push: true,
          email: true,
          can_access_message_read_status: true,
          settings_version: 0
        }
      })
    });

    store.dispatch(
      upsertServicePreference.failure(getServicePreferenceError())
    );
    expect(
      store.getState().features.services.details.preferencesById
    ).toStrictEqual({
      [serviceId]: pot.someError(preference, getServicePreferenceError())
    });
  });
});

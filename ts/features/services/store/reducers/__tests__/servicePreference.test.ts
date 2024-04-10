import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action, createStore } from "redux";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { NetworkError, getNetworkError } from "../../../../../utils/errors";
import {
  ServicePreference,
  ServicePreferenceResponse,
  WithServiceID
} from "../../../types/ServicePreferenceResponse";
import { loadServicePreference, upsertServicePreference } from "../../actions";
import {
  isErrorServicePreferenceSelector,
  isLoadingServicePreferenceSelector,
  servicePreferenceResponseSuccessSelector
} from "../servicePreference";
import { GlobalState } from "../../../../../store/reducers/types";

const serviceId = "serviceId" as ServiceId;

const servicePreferenceResponseSuccess: ServicePreferenceResponse = {
  id: serviceId,
  kind: "success",
  value: {
    inbox: true,
    push: true,
    email: false,
    can_access_message_read_status: false,
    settings_version: 0
  }
};

const servicePreferenceResponseFailure: ServicePreferenceResponse = {
  id: serviceId,
  kind: "notFound"
};

const servicePreferenceError: WithServiceID<NetworkError> = {
  id: serviceId,
  ...getNetworkError(new Error("GenericError"))
};

const updatingResponse: WithServiceID<ServicePreference> = {
  id: serviceId,
  inbox: true,
  push: true,
  email: true,
  can_access_message_read_status: true,
  settings_version: 0
};

describe("servicePreference reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.entities.services.servicePreference).toStrictEqual(pot.none);
  });

  it("should handle loadServicePreference action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(loadServicePreference.request(serviceId));

    expect(store.getState().entities.services.servicePreference).toStrictEqual(
      pot.noneLoading
    );

    store.dispatch(
      loadServicePreference.success(servicePreferenceResponseSuccess)
    );
    expect(store.getState().entities.services.servicePreference).toStrictEqual(
      pot.some(servicePreferenceResponseSuccess)
    );

    store.dispatch(loadServicePreference.failure(servicePreferenceError));
    expect(store.getState().entities.services.servicePreference).toStrictEqual(
      pot.someError(servicePreferenceResponseSuccess, servicePreferenceError)
    );
  });

  it("should handle upsertServicePreference action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const finalState: GlobalState = {
      ...state,
      entities: {
        ...state.entities,
        services: {
          ...state.entities.services,
          servicePreference: pot.some(servicePreferenceResponseSuccess)
        }
      }
    };
    const store = createStore(appReducer, finalState as any);

    store.dispatch(upsertServicePreference.request(updatingResponse));

    expect(store.getState().entities.services.servicePreference).toStrictEqual(
      pot.someUpdating(servicePreferenceResponseSuccess, {
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
    );

    store.dispatch(upsertServicePreference.failure(servicePreferenceError));
    expect(store.getState().entities.services.servicePreference).toStrictEqual(
      pot.someError(servicePreferenceResponseSuccess, servicePreferenceError)
    );
  });
});

describe("servicePreference selectors", () => {
  describe("servicePreferenceResponseSuccessSelector", () => {
    it("should return servicePreferenceResponseSuccess when pot.some and the service preference is successfully loaded", () => {
      const state = appReducer(
        {} as GlobalState,
        loadServicePreference.success(servicePreferenceResponseSuccess)
      );
      const servicePreferenceResponse =
        servicePreferenceResponseSuccessSelector(state);
      expect(servicePreferenceResponse).toStrictEqual(
        servicePreferenceResponseSuccess
      );
    });

    it("should return undefined when pot.some and the service preference is NOT successfully loaded", () => {
      const state = appReducer(
        {} as GlobalState,
        loadServicePreference.success(servicePreferenceResponseFailure)
      );
      const servicePreferenceResponse =
        servicePreferenceResponseSuccessSelector(state);
      expect(servicePreferenceResponse).toBeUndefined();
    });
  });

  describe("isLoadingServicePreferenceSelector", () => {
    it("should return true when pot.loading", () => {
      const state = appReducer(
        {} as GlobalState,
        loadServicePreference.request(serviceId)
      );

      const isLoadingServicePreference =
        isLoadingServicePreferenceSelector(state);
      expect(isLoadingServicePreference).toStrictEqual(true);
    });

    it("should return true when pot.updating", () => {
      const state = appReducer(
        {} as GlobalState,
        upsertServicePreference.request(updatingResponse)
      );

      const isLoadingServicePreference =
        isLoadingServicePreferenceSelector(state);
      expect(isLoadingServicePreference).toStrictEqual(true);
    });

    it("should return false when not pot.some", () => {
      expect(
        isLoadingServicePreferenceSelector(appReducer(undefined, {} as Action))
      ).toStrictEqual(false);

      expect(
        isLoadingServicePreferenceSelector(
          appReducer(
            {} as GlobalState,
            loadServicePreference.failure(servicePreferenceError)
          )
        )
      ).toStrictEqual(false);
    });
  });

  describe("isErrorServicePreferenceSelector", () => {
    it("should return true when pot.error", () => {
      const state = appReducer(
        {} as GlobalState,
        loadServicePreference.failure(servicePreferenceError)
      );

      const isErrorServicePreference = isErrorServicePreferenceSelector(state);
      expect(isErrorServicePreference).toStrictEqual(true);
    });

    it("should return true when pot.some and service is not successfully loaded", () => {
      const state = appReducer(
        {} as GlobalState,
        loadServicePreference.success(servicePreferenceResponseFailure)
      );

      const isErrorServicePreference = isErrorServicePreferenceSelector(state);
      expect(isErrorServicePreference).toStrictEqual(true);
    });

    it("should return false when pot.some and service is successfully loaded", () => {
      const state = appReducer(
        {} as GlobalState,
        loadServicePreference.success(servicePreferenceResponseSuccess)
      );

      const isErrorServicePreference = isErrorServicePreferenceSelector(state);
      expect(isErrorServicePreference).toStrictEqual(false);
    });
  });
});

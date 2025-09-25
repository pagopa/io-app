import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import {
  isErrorServicePreferenceSelector,
  isLoadingServicePreferenceSelector,
  servicePreferencePotByIdSelector,
  servicePreferenceResponseSuccessByIdSelector
} from "..";
import { ServiceId } from "../../../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
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
const serviceId3 = "serviceId3" as ServiceId;

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

const getServicePreferenceResponseFailure = (id = serviceId) =>
  ({
    id,
    kind: "notFound"
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

describe("preferencesById selectors", () => {
  describe("servicePreferencePotByIdSelector", () => {
    it("should return pot.none when service ID is undefined", () => {
      const state = appReducer(undefined, applicationChangeState("active"));

      const servicePreferencePot = servicePreferencePotByIdSelector(
        state,
        undefined
      );
      expect(servicePreferencePot).toStrictEqual(pot.none);
    });

    it("should return the correct preference pot for a service ID", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      // Initial state should be pot.none
      expect(
        servicePreferencePotByIdSelector(store.getState(), serviceId)
      ).toStrictEqual(pot.none);

      // After loading request
      store.dispatch(loadServicePreference.request(serviceId));
      expect(
        servicePreferencePotByIdSelector(store.getState(), serviceId)
      ).toStrictEqual(pot.noneLoading);

      // After successful load
      const preference = getServicePreferenceResponseSuccess();
      store.dispatch(loadServicePreference.success(preference));
      expect(
        servicePreferencePotByIdSelector(store.getState(), serviceId)
      ).toStrictEqual(pot.some(preference));
    });
  });

  describe("servicePreferenceResponseSuccessByIdSelector", () => {
    it("should return servicePreferenceResponseSuccess when pot.some and the service preference is successfully loaded", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      const preference = getServicePreferenceResponseSuccess();
      store.dispatch(loadServicePreference.success(preference));

      const servicePreferenceResponse =
        servicePreferenceResponseSuccessByIdSelector(
          store.getState(),
          serviceId
        );
      expect(servicePreferenceResponse).toStrictEqual(preference);
    });

    it("should return undefined when pot.some and the service preference is NOT successfully loaded", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      const failure = getServicePreferenceResponseFailure();
      store.dispatch(loadServicePreference.success(failure));

      const servicePreferenceResponse =
        servicePreferenceResponseSuccessByIdSelector(
          store.getState(),
          serviceId
        );
      expect(servicePreferenceResponse).toBeUndefined();
    });

    it("should return the correct preference when multiple services are loaded", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      // Load preferences for two different services
      const preference1 = getServicePreferenceResponseSuccess(serviceId);
      const preference2 = getServicePreferenceResponseSuccess(serviceId2);

      store.dispatch(loadServicePreference.success(preference1));
      store.dispatch(loadServicePreference.success(preference2));

      // Check that correct preferences are returned for each service
      const servicePreference1 = servicePreferenceResponseSuccessByIdSelector(
        store.getState(),
        serviceId
      );
      const servicePreference2 = servicePreferenceResponseSuccessByIdSelector(
        store.getState(),
        serviceId2
      );

      expect(servicePreference1).toStrictEqual(preference1);
      expect(servicePreference2).toStrictEqual(preference2);
    });
  });

  describe("isLoadingServicePreferenceSelector", () => {
    it("should return true when pot.loading", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(loadServicePreference.request(serviceId));

      const isLoadingServicePreference = isLoadingServicePreferenceSelector(
        store.getState(),
        serviceId
      );
      expect(isLoadingServicePreference).toStrictEqual(true);
    });

    it("should return true when pot.updating", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      const preference = getServicePreferenceResponseSuccess();
      store.dispatch(loadServicePreference.success(preference));
      store.dispatch(upsertServicePreference.request(getUpdatingResponse()));

      const isLoadingServicePreference = isLoadingServicePreferenceSelector(
        store.getState(),
        serviceId
      );
      expect(isLoadingServicePreference).toStrictEqual(true);
    });

    it("should return false when not pot.some", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      expect(
        isLoadingServicePreferenceSelector(store.getState(), serviceId)
      ).toStrictEqual(false);

      store.dispatch(
        loadServicePreference.failure(getServicePreferenceError())
      );

      expect(
        isLoadingServicePreferenceSelector(store.getState(), serviceId)
      ).toStrictEqual(false);
    });

    it("should correctly identify loading state for multiple services", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      // Load service 1
      store.dispatch(loadServicePreference.request(serviceId));

      // Load and complete service 2
      store.dispatch(loadServicePreference.request(serviceId2));
      store.dispatch(
        loadServicePreference.success(
          getServicePreferenceResponseSuccess(serviceId2)
        )
      );

      // Check that service 1 is loading but service 2 is not
      expect(
        isLoadingServicePreferenceSelector(store.getState(), serviceId)
      ).toStrictEqual(true);
      expect(
        isLoadingServicePreferenceSelector(store.getState(), serviceId2)
      ).toStrictEqual(false);
    });
  });

  describe("isErrorServicePreferenceSelector", () => {
    it("should return true when pot.error", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(
        loadServicePreference.failure(getServicePreferenceError())
      );

      const isErrorServicePreference = isErrorServicePreferenceSelector(
        store.getState(),
        serviceId
      );
      expect(isErrorServicePreference).toStrictEqual(true);
    });

    it("should return true when pot.some and service is not successfully loaded", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(
        loadServicePreference.success(getServicePreferenceResponseFailure())
      );

      const isErrorServicePreference = isErrorServicePreferenceSelector(
        store.getState(),
        serviceId
      );
      expect(isErrorServicePreference).toStrictEqual(true);
    });

    it("should return false when pot.some and service is successfully loaded", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      store.dispatch(
        loadServicePreference.success(getServicePreferenceResponseSuccess())
      );

      const isErrorServicePreference = isErrorServicePreferenceSelector(
        store.getState(),
        serviceId
      );
      expect(isErrorServicePreference).toStrictEqual(false);
    });

    it("should correctly identify error state for multiple services", () => {
      const state = appReducer(undefined, applicationChangeState("active"));
      const store = createStore(appReducer, state as any);

      // Service 1 succeeds
      store.dispatch(
        loadServicePreference.success(
          getServicePreferenceResponseSuccess(serviceId)
        )
      );

      // Service 2 fails
      store.dispatch(
        loadServicePreference.failure(getServicePreferenceError(serviceId2))
      );

      // Service 3 has "notFound" kind
      store.dispatch(
        loadServicePreference.success(
          getServicePreferenceResponseFailure(serviceId3)
        )
      );

      // Check that service 1 is not error but services 2 and 3 are
      expect(
        isErrorServicePreferenceSelector(store.getState(), serviceId)
      ).toStrictEqual(false);
      expect(
        isErrorServicePreferenceSelector(store.getState(), serviceId2)
      ).toStrictEqual(true);
      expect(
        isErrorServicePreferenceSelector(store.getState(), serviceId3)
      ).toStrictEqual(true);
    });
  });
});

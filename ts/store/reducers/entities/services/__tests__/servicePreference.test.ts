import * as pot from "italia-ts-commons/lib/pot";
import servicePreferenceReducer, {
  ServicePreferenceState
} from "../servicePreference";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../../../actions/services/servicePreference";
import {
  ServiceID,
  ServicePreference
} from "../../../../../types/services/ServicePreference";
import {
  ServicePreferenceResponse,
  WithServiceID
} from "../../../../../types/services/ServicePreferenceResponse";
import {
  getNetworkError,
  getNetworkErrorMessage,
  NetworkError
} from "../../../../../utils/errors";

const initialState: ServicePreferenceState = {};

describe("servicePreferenceReducer", () => {
  it("should handle the load request of servicePreference", () => {
    const action = loadServicePreference.request("s1" as ServiceID);

    const updatedState = servicePreferenceReducer(initialState, action);

    expect(updatedState).toMatchObject({ s1: pot.noneLoading });
  });

  it("should handle the success load of servicePreference", () => {
    const servicePreferenceResponse: ServicePreferenceResponse = {
      id: "s1" as ServiceID,
      kind: "success",
      value: {
        inbox: true,
        notifications: true,
        email: false
      }
    };

    const action = loadServicePreference.success(servicePreferenceResponse);

    const updatedState = servicePreferenceReducer(initialState, action);

    expect(updatedState).toMatchObject({
      s1: pot.some(servicePreferenceResponse)
    });
  });

  it("should handle the updating request and success case of servicePreference", () => {
    const state: ServicePreferenceState = {
      s1: pot.some({
        id: "s1" as ServiceID,
        kind: "success",
        value: {
          inbox: true,
          notifications: true,
          email: false
        }
      })
    };

    const updatingResponse: WithServiceID<ServicePreference> = {
      id: "s1" as ServiceID,
      inbox: true,
      notifications: true,
      email: true
    };

    const requestUpsert = upsertServicePreference.request(updatingResponse);

    const updatingState = servicePreferenceReducer(state, requestUpsert);

    expect(updatingState).toMatchObject({
      s1: pot.someUpdating(
        {
          id: "s1" as ServiceID,
          kind: "success",
          value: {
            inbox: true,
            notifications: true,
            email: false
          }
        },
        {
          id: "s1" as ServiceID,
          kind: "success",
          value: {
            inbox: true,
            notifications: true,
            email: true
          }
        }
      )
    });

    const successUpsert = upsertServicePreference.success({
      id: "s1" as ServiceID,
      kind: "success",
      value: {
        inbox: true,
        notifications: true,
        email: true
      }
    });

    const updatedState = servicePreferenceReducer(state, successUpsert);

    expect(updatedState).toMatchObject({
      s1: pot.some({
        id: "s1" as ServiceID,
        kind: "success",
        value: {
          inbox: true,
          notifications: true,
          email: true
        }
      })
    });
  });
});

it("should handle the error load of servicePreference", () => {
  const servicePreferenceError: WithServiceID<NetworkError> = {
    id: "s1" as ServiceID,
    ...getNetworkError(new Error("GenericError"))
  };

  const action = loadServicePreference.failure(servicePreferenceError);

  const updatedState = servicePreferenceReducer(initialState, action);

  expect(updatedState).toMatchObject({
    s1: pot.noneError(new Error(getNetworkErrorMessage(servicePreferenceError)))
  });
});

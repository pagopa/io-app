import * as pot from "italia-ts-commons/lib/pot";
import servicePreferenceReducer, {
  ServicePreferenceState
} from "../servicePreference";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../../../actions/services/servicePreference";
import {
  ServicePreferenceResponse,
  WithServiceID
} from "../../../../../types/services/ServicePreferenceResponse";
import {
  getNetworkError,
  getNetworkErrorMessage,
  NetworkError
} from "../../../../../utils/errors";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { EnabledChannels } from "../../../../../utils/profile";

const initialState: ServicePreferenceState = pot.none;

describe("servicePreferenceReducer", () => {
  it("should handle the load request of servicePreference", () => {
    const action = loadServicePreference.request("s1" as ServiceId);

    const updatedState = servicePreferenceReducer(initialState, action);

    expect(updatedState).toMatchObject(pot.noneLoading);
  });

  it("should handle the success load of servicePreference", () => {
    const servicePreferenceResponse: ServicePreferenceResponse = {
      id: "s1" as ServiceId,
      kind: "success",
      value: {
        inbox: true,
        push: true,
        email: false
      }
    };

    const action = loadServicePreference.success(servicePreferenceResponse);

    const updatedState = servicePreferenceReducer(initialState, action);

    expect(updatedState).toMatchObject(pot.some(servicePreferenceResponse));
  });

  it("should handle the updating request and success case of servicePreference", () => {
    const state: ServicePreferenceState = pot.some({
      id: "s1" as ServiceId,
      kind: "success",
      value: {
        inbox: true,
        push: true,
        email: false
      }
    });

    const updatingResponse: WithServiceID<EnabledChannels> = {
      id: "s1" as ServiceId,
      inbox: true,
      push: true,
      email: true
    };

    const requestUpsert = upsertServicePreference.request(updatingResponse);

    const updatingState = servicePreferenceReducer(state, requestUpsert);

    expect(updatingState).toMatchObject(
      pot.someUpdating(state.value, {
        id: "s1" as ServiceId,
        kind: "success",
        value: {
          inbox: true,
          push: true,
          email: true
        }
      })
    );

    const successUpsert = upsertServicePreference.success({
      id: "s1" as ServiceId,
      kind: "success",
      value: {
        inbox: true,
        push: true,
        email: true
      }
    });

    const updatedState = servicePreferenceReducer(state, successUpsert);

    expect(updatedState).toMatchObject(
      pot.some({
        id: "s1" as ServiceId,
        kind: "success",
        value: {
          inbox: true,
          push: true,
          email: true
        }
      })
    );
  });
});

it("should handle the error load of servicePreference", () => {
  const servicePreferenceError: WithServiceID<NetworkError> = {
    id: "s1" as ServiceId,
    ...getNetworkError(new Error("GenericError"))
  };

  const action = loadServicePreference.failure(servicePreferenceError);

  const updatedState = servicePreferenceReducer(initialState, action);

  expect(updatedState).toMatchObject(
    pot.noneError(new Error(getNetworkErrorMessage(servicePreferenceError)))
  );
});

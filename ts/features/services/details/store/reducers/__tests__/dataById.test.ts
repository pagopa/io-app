import * as pot from "@pagopa/ts-commons/lib/pot";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { Action, createStore } from "redux";
import { ServiceId } from "../../../../../../../definitions/services/ServiceId";
import { ServiceDetails } from "../../../../../../../definitions/services/ServiceDetails";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  logoutSuccess,
  sessionExpired
} from "../../../../../authentication/common/store/actions";
import { loadServiceDetail } from "../../actions/details";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../../utils/tests";

const serviceId = "serviceId" as ServiceId;

const service = {
  id: serviceId,
  name: "name",
  organization: {
    fiscal_code: "FSCLCD" as OrganizationFiscalCode,
    name: "Ċentru tas-Saħħa"
  }
} as ServiceDetails;

describe("dataById reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.services.details.dataById).toStrictEqual({});
  });

  it("should handle loadServiceDetail action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(loadServiceDetail.request(serviceId));

    expect(store.getState().features.services.details.dataById).toStrictEqual({
      serviceId: pot.noneLoading
    });

    store.dispatch(loadServiceDetail.success(service));
    expect(store.getState().features.services.details.dataById).toStrictEqual({
      serviceId: pot.some(service)
    });

    const tError = {
      error: new Error("load failed"),
      service_id: serviceId
    };

    store.dispatch(loadServiceDetail.failure(tError));
    expect(store.getState().features.services.details.dataById).toStrictEqual({
      serviceId: pot.someError(service, new Error("load failed"))
    });
  });

  it("should handle logoutSuccess action", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service),
      logoutSuccess()
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    expect(state.features.services.details.dataById).toEqual({});
  });

  it("should handle sessionExpired action", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service),
      sessionExpired()
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    expect(state.features.services.details.dataById).toEqual({});
  });
});

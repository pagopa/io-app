import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  svGenerateVoucherAvailableDestination,
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import { getTimeoutError } from "../../../../../../utils/errors";
import { AvailableDestinations } from "../../../types/SvVoucherRequest";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../bpd/model/RemoteValue";

const genericError = getTimeoutError();
const mockDestination = { stato: "1", latitudine: 1, longitudine: 1 };
const mockResponse: AvailableDestinations = ["dest1", "dest2"];

describe("Test availableDestination reducer", () => {
  it("Initial state should be remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.bonus.sv.voucherGeneration.availableDestinations
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteUndefined after if the voucher generation workunit starts", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherStart());

    expect(
      store.getState().bonus.sv.voucherGeneration.availableDestinations
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      svGenerateVoucherAvailableDestination.request(mockDestination)
    );

    expect(
      store.getState().bonus.sv.voucherGeneration.availableDestinations
    ).toStrictEqual(remoteLoading);
  });
  it("Should be remoteReady with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableDestination.success(mockResponse));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableDestinations
    ).toStrictEqual(remoteReady(mockResponse));
  });
  it("Should be remoteError if is dispatched a failure", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      svGenerateVoucherAvailableDestination.request(mockDestination)
    );
    store.dispatch(svGenerateVoucherAvailableDestination.failure(genericError));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableDestinations
    ).toStrictEqual(remoteError(genericError));
  });
});

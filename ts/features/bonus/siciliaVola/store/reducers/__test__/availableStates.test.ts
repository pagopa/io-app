import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import { getTimeoutError } from "../../../../../../utils/errors";
import { State } from "../../../types/SvVoucherRequest";
import { toIndexed } from "../../../../../../store/helpers/indexer";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../bpd/model/RemoteValue";

const genericError = getTimeoutError();

const mockResponse: ReadonlyArray<State> = [
  { id: 1, name: "stat1" },
  { id: 2, name: "stat2" }
];

describe("Test availableRegion reducer", () => {
  it("Initial state should be remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteUndefined after if the voucher generation workunit starts", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherStart());

    expect(
      store.getState().bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableState.request());

    expect(
      store.getState().bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(remoteLoading);
  });
  it("Should be remoteReady with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableState.success(mockResponse));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(remoteReady(toIndexed(mockResponse, mR => mR.id)));
  });
  it("Should be remoteError if is dispatched a failure after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableState.request());
    store.dispatch(svGenerateVoucherAvailableState.failure(genericError));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(remoteError(genericError));
  });
});

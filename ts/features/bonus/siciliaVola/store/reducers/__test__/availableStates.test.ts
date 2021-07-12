import * as pot from "italia-ts-commons/lib/pot";
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

const genericError = getTimeoutError();

const mockResponse: ReadonlyArray<State> = [
  { id: 1, name: "stat1" },
  { id: 2, name: "stat2" }
];

describe("Test availableRegion reducer", () => {
  it("Initial state should be pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(pot.none);
  });
  it("Should be pot.none after if the voucher generation workunit starts", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherStart());

    expect(
      store.getState().bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(pot.none);
  });
  it("Should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableState.request());

    expect(
      store.getState().bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(pot.noneLoading);
  });
  it("Should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableState.success(mockResponse));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(pot.some(toIndexed(mockResponse, mR => mR.id)));
  });
  it("Should be pot.Error if is dispatched a failure after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableState.request());
    store.dispatch(svGenerateVoucherAvailableState.failure(genericError));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableStates
    ).toStrictEqual(pot.toError(pot.none, genericError));
  });
});

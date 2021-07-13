import * as pot from "italia-ts-commons/lib/pot";
import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  svGenerateVoucherAvailableRegion,
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import { getTimeoutError } from "../../../../../../utils/errors";
import { Region, State } from "../../../types/SvVoucherRequest";
import { toIndexed } from "../../../../../../store/helpers/indexer";

const genericError = getTimeoutError();
const mockState: State = {
  id: 1,
  name: "state1"
};

const mockResponse: ReadonlyArray<Region> = [
  { id: 1, name: "reg1" },
  { id: 2, name: "reg2" }
];

describe("Test availableRegion reducer", () => {
  it("Initial state should be pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.bonus.sv.voucherGeneration.availableRegions
    ).toStrictEqual(pot.none);
  });
  it("Should be pot.none after if the voucher generation workunit starts", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherStart());

    expect(
      store.getState().bonus.sv.voucherGeneration.availableRegions
    ).toStrictEqual(pot.none);
  });
  it("Should be pot.none after if is dispatched a state request action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(svGenerateVoucherAvailableState.request());
    expect(
      store.getState().bonus.sv.voucherGeneration.availableRegions
    ).toStrictEqual(pot.none);
  });
  it("Should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableRegion.request(mockState));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableRegions
    ).toStrictEqual(pot.noneLoading);
  });
  it("Should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableRegion.success(mockResponse));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableRegions
    ).toStrictEqual(pot.some(toIndexed(mockResponse, mR => mR.id)));
  });
  it("Should be pot.Error if is dispatched a failure after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherAvailableRegion.request(mockState));
    store.dispatch(svGenerateVoucherAvailableRegion.failure(genericError));

    expect(
      store.getState().bonus.sv.voucherGeneration.availableRegions
    ).toStrictEqual(pot.toError(pot.none, genericError));
  });
});

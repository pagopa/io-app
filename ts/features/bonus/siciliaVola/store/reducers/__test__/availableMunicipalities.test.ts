import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  svGenerateVoucherAvailableMunicipality,
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import { getTimeoutError } from "../../../../../../utils/errors";
import { Municipality } from "../../../types/SvVoucherRequest";
import { toIndexed } from "../../../../../../store/helpers/indexer";
import {
  remoteError,
  remoteReady,
  remoteUndefined
} from "../../../../bpd/model/RemoteValue";

const genericError = getTimeoutError();

const mockResponse: ReadonlyArray<Municipality> = [
  { id: "A010", name: "mun1", latitude: 1, longitude: 1 },
  { id: "A020", name: "mun2", latitude: 2, longitude: 2 }
];

describe("Test availableMunicipality reducer", () => {
  it("Initial state should be remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.bonus.sv.voucherGeneration.availableMunicipalities
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteUndefined after if the voucher generation workunit starts", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherStart());

    expect(
      store.getState().bonus.sv.voucherGeneration.availableMunicipalities
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteUndefined after if is dispatched a state request action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(svGenerateVoucherAvailableState.request());
    expect(
      store.getState().bonus.sv.voucherGeneration.availableMunicipalities
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteReady with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      svGenerateVoucherAvailableMunicipality.success(mockResponse)
    );

    expect(
      store.getState().bonus.sv.voucherGeneration.availableMunicipalities
    ).toStrictEqual(remoteReady(toIndexed(mockResponse, mR => mR.id)));
  });
  it("Should be remoteError if is dispatched a failure after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(
      svGenerateVoucherAvailableMunicipality.failure(genericError)
    );

    expect(
      store.getState().bonus.sv.voucherGeneration.availableMunicipalities
    ).toStrictEqual(remoteError(genericError));
  });
});

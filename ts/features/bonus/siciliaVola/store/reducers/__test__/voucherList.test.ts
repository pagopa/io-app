import * as pot from "italia-ts-commons/lib/pot";
import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { getTimeoutError } from "../../../../../../utils/errors";
import { toIndexed } from "../../../../../../store/helpers/indexer";
import { svVoucherListGet } from "../../actions/voucherList";
import { SvVoucher, SvVoucherId } from "../../../types/svVoucher";

const genericError = getTimeoutError();

const mockResponse: ReadonlyArray<SvVoucher> = [
  {
    id: "abc123" as SvVoucherId
  } as SvVoucher,
  {
    id: "def456" as SvVoucherId
  } as SvVoucher
];

describe("Test availableRegion reducer", () => {
  it("Initial state should be pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.bonus.sv.voucherList).toStrictEqual(pot.none);
  });
  it("Should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svVoucherListGet.request());

    expect(store.getState().bonus.sv.voucherList).toStrictEqual(
      pot.noneLoading
    );
  });
  it("Should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svVoucherListGet.success(mockResponse));

    expect(store.getState().bonus.sv.voucherList).toStrictEqual(
      pot.some(toIndexed(mockResponse, mR => mR.id))
    );
  });
  it("Should be pot.Error if is dispatched a failure after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svVoucherListGet.request());
    store.dispatch(svVoucherListGet.failure(genericError));

    expect(store.getState().bonus.sv.voucherList).toStrictEqual(
      pot.toError(pot.none, genericError)
    );
  });
});

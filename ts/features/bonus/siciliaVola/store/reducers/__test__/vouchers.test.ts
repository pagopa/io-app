import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { getTimeoutError } from "../../../../../../utils/errors";
import { toIndexed } from "../../../../../../store/helpers/indexer";
import { svSetFilter, svVoucherListGet } from "../../actions/voucherList";
import { SvVoucherId } from "../../../types/SvVoucher";
import {
  SvVoucherListResponse,
  VoucherPreview
} from "../../../types/SvVoucherResponse";
import { svGenerateVoucherCompleted } from "../../actions/voucherGeneration";

const genericError = getTimeoutError();

const mockResponse: SvVoucherListResponse = [
  {
    idVoucher: 12345 as SvVoucherId
  } as VoucherPreview,
  {
    idVoucher: 67890 as SvVoucherId
  } as VoucherPreview
];

const mockResponse2: SvVoucherListResponse = [
  {
    idVoucher: 45123 as SvVoucherId
  } as VoucherPreview,
  {
    idVoucher: 90678 as SvVoucherId
  } as VoucherPreview
];

describe("Test vouchers reducer", () => {
  it("Initial state should be an empty object", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.bonus.sv.voucherList.vouchers).toStrictEqual({});
  });
  it("Should be in the initial state after the svSetFilter or svGenerateVoucherCompleted actions are dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svSetFilter({}));
    expect(store.getState().bonus.sv.voucherList.vouchers).toStrictEqual({});
    store.dispatch(svGenerateVoucherCompleted());
    expect(store.getState().bonus.sv.voucherList.vouchers).toStrictEqual({});
  });
  it("Should contain the new object when svVoucherListGet.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svVoucherListGet.success(mockResponse));

    const indexedMockResponse = toIndexed(mockResponse, mR => mR.idVoucher);
    expect(store.getState().bonus.sv.voucherList.vouchers).toStrictEqual(
      indexedMockResponse
    );
    store.dispatch(svVoucherListGet.success(mockResponse2));

    expect(store.getState().bonus.sv.voucherList.vouchers).toStrictEqual({
      ...indexedMockResponse,
      ...toIndexed(mockResponse2, mR2 => mR2.idVoucher)
    });
  });
  it("The state should remain unchanged if is dispatched a svVoucherListGet.request or a svVoucherListGet.failure action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const initialState = {};
    expect(store.getState().bonus.sv.voucherList.vouchers).toStrictEqual(
      initialState
    );
    store.dispatch(svVoucherListGet.request({}));
    expect(store.getState().bonus.sv.voucherList.vouchers).toStrictEqual(
      initialState
    );
    store.dispatch(svVoucherListGet.failure(genericError));
    expect(store.getState().bonus.sv.voucherList.vouchers).toStrictEqual(
      initialState
    );
  });
});

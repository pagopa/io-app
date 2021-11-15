import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  svGenerateVoucherGeneratedVoucher,
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import { getTimeoutError } from "../../../../../../utils/errors";
import { University, VoucherRequest } from "../../../types/SvVoucherRequest";
import { SvVoucherGeneratedResponse } from "../../../types/SvVoucherResponse";
import { SvVoucher, SvVoucherId } from "../../../types/SvVoucher";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../bpd/model/RemoteValue";

const genericError = getTimeoutError();
const mockVoucherRequest: VoucherRequest = {
  category: "student",
  university: {} as University,
  departureDate: new Date()
};
const mockResponse: SvVoucherGeneratedResponse = {
  kind: "success",
  value: {
    id: 12345 as SvVoucherId
  } as SvVoucher
};

describe("Test voucherGenerated reducer", () => {
  it("Initial state should be remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteUndefined after if the voucher generation workunit starts", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherStart());

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(remoteUndefined);
  });
  it("Should be remoteLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      svGenerateVoucherGeneratedVoucher.request(mockVoucherRequest)
    );

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(remoteLoading);
  });
  it("Should be remoteReady with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherGeneratedVoucher.success(mockResponse));

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(remoteReady(mockResponse));
  });
  it("Should be remoteError if is dispatched a failure after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      svGenerateVoucherGeneratedVoucher.request(mockVoucherRequest)
    );
    store.dispatch(svGenerateVoucherGeneratedVoucher.failure(genericError));

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(remoteError(genericError));
  });
});

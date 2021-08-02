import * as pot from "italia-ts-commons/lib/pot";
import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  svGenerateVoucherGeneratedVoucher,
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import { getTimeoutError } from "../../../../../../utils/errors";
import { University, VoucherRequest } from "../../../types/SvVoucherRequest";
import { SvVoucherGeneratedResponse } from "../../../types/svVoucherResponse";
import { SvVoucher, SvVoucherId } from "../../../types/svVoucher";

const genericError = getTimeoutError();
const mockVoucherRequest: VoucherRequest = {
  category: "student",
  university: {} as University,
  departureDate: new Date()
};
const mockResponse: SvVoucherGeneratedResponse = {
  kind: "success",
  value: {
    id: "abc123" as SvVoucherId
  } as SvVoucher
};

describe("Test voucherGenerated reducer", () => {
  it("Initial state should be pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(pot.none);
  });
  it("Should be pot.none after if the voucher generation workunit starts", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherStart());

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(pot.none);
  });
  it("Should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      svGenerateVoucherGeneratedVoucher.request(mockVoucherRequest)
    );

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(pot.noneLoading);
  });
  it("Should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherGeneratedVoucher.success(mockResponse));

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(pot.some(mockResponse));
  });
  it("Should be pot.Error if is dispatched a failure after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      svGenerateVoucherGeneratedVoucher.request(mockVoucherRequest)
    );
    store.dispatch(svGenerateVoucherGeneratedVoucher.failure(genericError));

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherGenerated
    ).toStrictEqual(pot.toError(pot.none, genericError));
  });
});

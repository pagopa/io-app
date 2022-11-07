import { createStore } from "redux";
import * as O from "fp-ts/lib/Option";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  FlightsDate,
  svGenerateVoucherSelectCategory,
  svGenerateVoucherSelectCompany,
  svGenerateVoucherSelectFlightsDate,
  svGenerateVoucherSelectHospital,
  svGenerateVoucherSelectUniversity,
  svGenerateVoucherStart,
  svGenerateVoucherUnderThresholdIncome
} from "../../actions/voucherGeneration";
import {
  Company,
  Hospital,
  SvBeneficiaryCategory,
  University
} from "../../../types/SvVoucherRequest";
import { VoucherRequestState } from "../voucherGeneration/voucherRequest";

const mockCategoryStudent: SvBeneficiaryCategory = "student";
const mockCategoryWorker: SvBeneficiaryCategory = "worker";
const mockCategorySick: SvBeneficiaryCategory = "sick";
const mockCompany: Company = {
  businessName: "myCompany",
  vat: "1234abcd",
  state: { id: 1, name: "state1" },
  municipality: { id: "A010", name: "mun1", latitude: 1, longitude: 1 }
};
const mockHospital: Hospital = {
  hospitalName: "myHospital",
  state: { id: 1, name: "state1" },
  municipality: { id: "A010", name: "mun1", latitude: 1, longitude: 1 }
};
const mockUniversity: University = {
  universityName: "myUniversity",
  state: { id: 1, name: "state1" },
  municipality: { id: "A010", name: "mun1", latitude: 1, longitude: 1 }
};
const mockFlightsDate: FlightsDate = {
  departureDate: new Date(),
  returnDate: new Date()
};

describe("Test availableRegion reducer", () => {
  it("Initial state should be none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.bonus.sv.voucherGeneration.voucherRequest).toStrictEqual(
      O.none
    );
  });
  it("Should none after if the voucher generation workunit starts", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherStart());
    expect(globalState.bonus.sv.voucherGeneration.voucherRequest).toStrictEqual(
      O.none
    );
  });
  it("Should be some with the category valued after the select category action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryStudent));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryStudent
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should be some and update the underThresholdIncome field if the category is worker or sick after the underThresholdIncome action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryWorker));
    store.dispatch(svGenerateVoucherUnderThresholdIncome(true));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryWorker,
      underThresholdIncome: true
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should return the same state if the category is not worker or sick or the voucherRequest is none after the underThresholdIncome action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(svGenerateVoucherUnderThresholdIncome(true));
    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(O.none);

    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryStudent));
    store.dispatch(svGenerateVoucherUnderThresholdIncome(true));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryStudent
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should be some and update the company field if the category is worker after the select company action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryWorker));
    store.dispatch(svGenerateVoucherSelectCompany(mockCompany));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryWorker,
      company: mockCompany
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should return the same state if the category is not worker or the voucherRequest is none after the select company action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(svGenerateVoucherSelectCompany(mockCompany));
    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(O.none);

    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryStudent));
    store.dispatch(svGenerateVoucherSelectCompany(mockCompany));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryStudent
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should be some and update the hospital field if the category is sick after the select hospital action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherSelectCategory(mockCategorySick));
    store.dispatch(svGenerateVoucherSelectHospital(mockHospital));

    const mockState: VoucherRequestState = O.some({
      category: mockCategorySick,
      hospital: mockHospital
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should return the same state if the category is not sick or the voucherRequest is none after the select hospital action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherSelectHospital(mockHospital));
    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(O.none);

    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryWorker));
    store.dispatch(svGenerateVoucherSelectHospital(mockHospital));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryWorker
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should be some and update the university field if the category is student after the select university action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryStudent));
    store.dispatch(svGenerateVoucherSelectUniversity(mockUniversity));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryStudent,
      university: mockUniversity
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should return the same state if the category is not student or the voucherRequest is none after the select university action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherSelectUniversity(mockUniversity));
    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(O.none);

    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryWorker));
    store.dispatch(svGenerateVoucherSelectUniversity(mockUniversity));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryWorker
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
  it("Should be some and update the departureDate and the returnDate fields after the select flights date action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(svGenerateVoucherSelectCategory(mockCategoryStudent));
    store.dispatch(svGenerateVoucherSelectFlightsDate(mockFlightsDate));

    const mockState: VoucherRequestState = O.some({
      category: mockCategoryStudent,
      departureDate: mockFlightsDate.departureDate,
      returnDate: mockFlightsDate.returnDate
    });

    expect(
      store.getState().bonus.sv.voucherGeneration.voucherRequest
    ).toStrictEqual(mockState);
  });
});

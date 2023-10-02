import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { IdPayCodeState } from "../reducers";
import {
  idPayCodeEnrollmentRequestSelector,
  idPayCodeSelector,
  idPayCodeStateSelector,
  isIdPayCodeOnboardedSelector
} from "../selectors";
import {
  idPayEnrollCode,
  idPayGenerateCode,
  idPayGetCodeStatus
} from "../actions";
import { getGenericError } from "../../../../../utils/errors";

describe("Test IdPay Code reducers and selectors", () => {
  it("should have initial state", () => {
    const initialState: IdPayCodeState = {
      code: pot.none,
      enrollmentRequest: pot.none,
      isOnboarded: pot.none
    };

    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(globalState.features.idPay.code).toStrictEqual(initialState);
    expect(idPayCodeStateSelector(globalState)).toStrictEqual(initialState);
    expect(isIdPayCodeOnboardedSelector(globalState)).toStrictEqual(false);
    expect(idPayCodeEnrollmentRequestSelector(globalState)).toStrictEqual(
      pot.none
    );
    expect(idPayCodeSelector(globalState)).toStrictEqual(pot.none);
  });

  it("should handle idPayGetCodeStatus action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(idPayGetCodeStatus.request());
    expect(store.getState().features.idPay.code.isOnboarded).toStrictEqual(
      pot.noneLoading
    );

    store.dispatch(idPayGetCodeStatus.success({ isIdPayCodeEnabled: true }));
    expect(store.getState().features.idPay.code.isOnboarded).toStrictEqual(
      pot.some(true)
    );
    expect(isIdPayCodeOnboardedSelector(store.getState())).toStrictEqual(true);

    const error = {
      ...getGenericError(new Error(""))
    };

    store.dispatch(idPayGetCodeStatus.failure(error));
    expect(store.getState().features.idPay.code.isOnboarded).toStrictEqual(
      pot.someError(true, error)
    );
    expect(isIdPayCodeOnboardedSelector(store.getState())).toStrictEqual(true);
  });

  it("should handle idPayGenerateCode action", () => {
    const tCode = "12345";

    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(idPayGenerateCode.request({}));
    expect(store.getState().features.idPay.code.code).toStrictEqual(
      pot.noneLoading
    );
    expect(idPayCodeSelector(store.getState())).toStrictEqual(pot.noneLoading);

    store.dispatch(idPayGenerateCode.success({ idpayCode: tCode }));
    expect(store.getState().features.idPay.code.code).toStrictEqual(
      pot.some(tCode)
    );
    expect(idPayCodeSelector(store.getState())).toStrictEqual(pot.some(tCode));

    const error = {
      ...getGenericError(new Error(""))
    };

    store.dispatch(idPayGenerateCode.failure(error));
    expect(store.getState().features.idPay.code.code).toStrictEqual(
      pot.someError(tCode, error)
    );
    expect(idPayCodeSelector(store.getState())).toStrictEqual(
      pot.someError(tCode, error)
    );
  });

  it("should handle idPayEnrollCode action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(idPayEnrollCode.request({ initiativeId: "abc" }));
    expect(
      store.getState().features.idPay.code.enrollmentRequest
    ).toStrictEqual(pot.noneLoading);
    expect(idPayCodeEnrollmentRequestSelector(store.getState())).toStrictEqual(
      pot.noneLoading
    );

    store.dispatch(idPayEnrollCode.success());
    expect(
      store.getState().features.idPay.code.enrollmentRequest
    ).toStrictEqual(pot.some(undefined));
    expect(idPayCodeEnrollmentRequestSelector(store.getState())).toStrictEqual(
      pot.some(undefined)
    );

    const error = {
      ...getGenericError(new Error(""))
    };

    store.dispatch(idPayEnrollCode.failure(error));
    expect(
      store.getState().features.idPay.code.enrollmentRequest
    ).toStrictEqual(pot.someError(undefined, error));
    expect(idPayCodeEnrollmentRequestSelector(store.getState())).toStrictEqual(
      pot.someError(undefined, error)
    );
  });
});

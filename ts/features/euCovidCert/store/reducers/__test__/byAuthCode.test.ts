import * as pot from "italia-ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GenericError } from "../../../../../utils/errors";
import { EUCovidCertificateAuthCode } from "../../../types/EUCovidCertificate";
import {
  EUCovidCertificateResponse,
  WithEUCovidCertAuthCode
} from "../../../types/EUCovidCertificateResponse";
import { euCovidCertificateGet } from "../../actions";
import { euCovidCertificateFromAuthCodeSelector } from "../byAuthCode";

const authCode = "authCode1" as EUCovidCertificateAuthCode;
const mockResponseSuccess: EUCovidCertificateResponse = {
  authCode,
  kind: "notFound"
};

const mockFailure: WithEUCovidCertAuthCode<GenericError> = {
  authCode,
  kind: "generic",
  value: new Error("A generic error")
};

describe("Test byAuthCode reducer & selector behaviour", () => {
  it("Initial state should be pot.none", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.euCovidCert.byAuthCode).toStrictEqual({});
    expect(
      euCovidCertificateFromAuthCodeSelector(globalState, authCode)
    ).toStrictEqual(pot.none);
  });
  it("Should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(euCovidCertificateGet.request(authCode));

    const byAuthCode = store.getState().features.euCovidCert.byAuthCode;

    expect(byAuthCode[authCode]).toStrictEqual(pot.noneLoading);
    expect(
      euCovidCertificateFromAuthCodeSelector(store.getState(), authCode)
    ).toStrictEqual(pot.noneLoading);
  });
  it("Should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(euCovidCertificateGet.request(authCode));
    store.dispatch(euCovidCertificateGet.success(mockResponseSuccess));

    expect(
      store.getState().features.euCovidCert.byAuthCode[authCode]
    ).toStrictEqual(pot.some(mockResponseSuccess));
    expect(
      euCovidCertificateFromAuthCodeSelector(store.getState(), authCode)
    ).toStrictEqual(pot.some(mockResponseSuccess));

    store.dispatch(euCovidCertificateGet.request(authCode));

    expect(
      store.getState().features.euCovidCert.byAuthCode[authCode]
    ).toStrictEqual(pot.someLoading(mockResponseSuccess));
    expect(
      euCovidCertificateFromAuthCodeSelector(store.getState(), authCode)
    ).toStrictEqual(pot.someLoading(mockResponseSuccess));

    store.dispatch(euCovidCertificateGet.failure(mockFailure));

    expect(
      store.getState().features.euCovidCert.byAuthCode[authCode]
    ).toStrictEqual(pot.someError(mockResponseSuccess, mockFailure.value));
    expect(
      euCovidCertificateFromAuthCodeSelector(store.getState(), authCode)
    ).toStrictEqual(pot.someError(mockResponseSuccess, mockFailure.value));
  });
  it("Should be pot.noneError after the failure action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(euCovidCertificateGet.request(authCode));
    store.dispatch(euCovidCertificateGet.failure(mockFailure));

    expect(
      store.getState().features.euCovidCert.byAuthCode[authCode]
    ).toStrictEqual(pot.noneError(mockFailure.value));
    expect(
      euCovidCertificateFromAuthCodeSelector(store.getState(), authCode)
    ).toStrictEqual(pot.noneError(mockFailure.value));

    store.dispatch(euCovidCertificateGet.request(authCode));
    expect(
      store.getState().features.euCovidCert.byAuthCode[authCode]
    ).toStrictEqual(pot.noneLoading);
    expect(
      euCovidCertificateFromAuthCodeSelector(store.getState(), authCode)
    ).toStrictEqual(pot.noneLoading);

    store.dispatch(euCovidCertificateGet.success(mockResponseSuccess));

    expect(
      store.getState().features.euCovidCert.byAuthCode[authCode]
    ).toStrictEqual(pot.some(mockResponseSuccess));
    expect(
      euCovidCertificateFromAuthCodeSelector(store.getState(), authCode)
    ).toStrictEqual(pot.some(mockResponseSuccess));
  });
});

import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../../utils/errors";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../../bonus/bpd/model/RemoteValue";
import { searchUserBPay } from "../../actions";
import { onboardingBPayFoundAccountsSelector } from "../foundBpay";
import { bPayAttMock, bPayDisMock } from "../__mock__/bpay.mock";

jest.mock("@react-native-async-storage/async-storage", () => ({
  AsyncStorage: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("test onboardingBPayFoundAccountsSelector", () => {
  const globalState: GlobalState = appReducer(
    undefined,
    applicationChangeState("active")
  );
  it("should return RemoteUndefined with the default state", () => {
    expect(onboardingBPayFoundAccountsSelector(globalState)).toBe(
      remoteUndefined
    );
  });
  it("should return RemoteLoading after dispatch searchUserBPay.request", () => {
    const loadingState: GlobalState = appReducer(
      globalState,
      searchUserBPay.request(undefined)
    );

    expect(onboardingBPayFoundAccountsSelector(loadingState)).toBe(
      remoteLoading
    );
  });
  it("should return RemoteError after dispatch searchUserBPay.failure", () => {
    const error: NetworkError = { kind: "timeout" };

    const loadingState: GlobalState = appReducer(
      globalState,
      searchUserBPay.failure(error)
    );

    expect(onboardingBPayFoundAccountsSelector(loadingState)).toStrictEqual(
      remoteError(error)
    );
  });
  it("should return remoteReady with a BPay serviceState===ATT", () => {
    const loadingState: GlobalState = appReducer(
      globalState,
      searchUserBPay.success([bPayAttMock])
    );

    expect(onboardingBPayFoundAccountsSelector(loadingState)).toStrictEqual(
      remoteReady([bPayAttMock])
    );
  });
  it("should return remoteReady with an empty array if BPay serviceState===DIS", () => {
    const loadingState: GlobalState = appReducer(
      globalState,
      searchUserBPay.success([bPayDisMock])
    );

    expect(onboardingBPayFoundAccountsSelector(loadingState)).toStrictEqual(
      remoteReady([])
    );
  });
  it("should return remoteReady with only BPay with serviceState!==DIS", () => {
    const loadingState: GlobalState = appReducer(
      globalState,
      searchUserBPay.success([bPayDisMock, bPayAttMock])
    );

    expect(onboardingBPayFoundAccountsSelector(loadingState)).toStrictEqual(
      remoteReady([bPayAttMock])
    );
  });
  it("should return a BPay with a generic serviceState", () => {
    const unknownServiceState = { ...bPayAttMock, serviceState: "UNKNOWN" };

    const loadingState: GlobalState = appReducer(
      globalState,
      searchUserBPay.success([unknownServiceState])
    );

    expect(onboardingBPayFoundAccountsSelector(loadingState)).toStrictEqual(
      remoteReady([unknownServiceState])
    );
  });
  it("should return a BPay with an undefined serviceState", () => {
    const undefinedServiceState = { ...bPayAttMock, serviceState: undefined };

    const loadingState: GlobalState = appReducer(
      globalState,
      searchUserBPay.success([undefinedServiceState])
    );

    expect(onboardingBPayFoundAccountsSelector(loadingState)).toStrictEqual(
      remoteReady([undefinedServiceState])
    );
  });
});

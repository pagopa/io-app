import { GlobalState } from "../../../../../../store/reducers/types";
import { appReducer } from "../../../../../../store/reducers";
import {
  isReady,
  remoteError,
  remoteLoading,
  remoteReady
} from "../../../../../../common/model/RemoteValue";
import { cgnGenerateOtp } from "../../actions/otp";
import { cgnOtpDataSelector } from "../otp";
import { OtpCode } from "../../../../../../../definitions/cgn/OtpCode";
import { getGenericError } from "../../../../../../utils/errors";

describe("cgnOtpReducer", () => {
  it("should be loading", () => {
    const onError = jest.fn();
    const onSuccess = jest.fn();
    const globalState: GlobalState = appReducer(
      undefined,
      cgnGenerateOtp.request({
        onError,
        onSuccess
      })
    );
    expect(cgnOtpDataSelector(globalState)).toEqual(remoteLoading);
  });

  it("should be ready", () => {
    const otpData = {
      code: "M6R3E4PNG36" as OtpCode,
      expires_at: new Date("2021-09-08T00:53:12.966Z"),
      ttl: 100
    };
    const globalState: GlobalState = appReducer(
      undefined,
      cgnGenerateOtp.success(otpData)
    );
    expect(isReady(cgnOtpDataSelector(globalState))).toBeTruthy();
    if (isReady(cgnOtpDataSelector(globalState))) {
      expect(cgnOtpDataSelector(globalState)).toEqual(remoteReady(otpData));
    }
  });

  it("should be error", () => {
    const genericError = getGenericError(new Error("an error"));
    const globalState: GlobalState = appReducer(
      undefined,
      cgnGenerateOtp.failure(genericError)
    );
    expect(cgnOtpDataSelector(globalState)).toEqual(remoteError(genericError));
  });
});

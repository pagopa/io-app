import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getGenericError } from "../../../../../../../utils/errors";

import { cgnGenerateOtp } from "..";
import { Otp } from "../../../../../../../../definitions/cgn/Otp";
import { OtpCode } from "../../../../../../../../definitions/cgn/OtpCode";
import { cgnGenerateOtp as cgnGenerateOtpAction } from "../../../../store/actions/otp";
import { setMerchantDiscountCode } from "../../../../store/actions/merchants";

describe("cgnGenerateOtp", () => {
  const otpResult: Otp = {
    code: "123456" as OtpCode,
    expires_at: new Date(),
    ttl: 300
  };
  const requestAction = cgnGenerateOtpAction.request({
    onSuccess: jest.fn(),
    onError: jest.fn()
  });
  const fetchGenerateOtp = jest.fn();

  it("should dispatch success action on successful API call", () => {
    testSaga(cgnGenerateOtp, fetchGenerateOtp, requestAction)
      .next()
      .next(E.right({ status: 200, value: otpResult }))
      .put(cgnGenerateOtpAction.success(otpResult))
      .next()
      .put(setMerchantDiscountCode(otpResult.code))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = E.left([]);
    const expectedError = new Error(readableReport([]));

    testSaga(cgnGenerateOtp, fetchGenerateOtp, requestAction)
      .next()
      .next(leftResponse)
      .put(cgnGenerateOtpAction.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    testSaga(cgnGenerateOtp, fetchGenerateOtp, requestAction)
      .next()
      .next(E.right({ status: 401 }))
      .next()
      .isDone();
  });

  it("should dispatch failure on non-200 non-401 response", () => {
    const status = 500;
    const expectedError = new Error(`response status ${status}`);

    testSaga(cgnGenerateOtp, fetchGenerateOtp, requestAction)
      .next()
      .next(E.right({ status }))
      .put(cgnGenerateOtpAction.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnGenerateOtp, fetchGenerateOtp, requestAction)
      .next()
      .throw(networkError)
      .put(cgnGenerateOtpAction.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });
});

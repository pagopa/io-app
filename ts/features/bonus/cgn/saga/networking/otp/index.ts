import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnGenerateOtp as cgnGenerateOtpAction } from "../../../store/actions/otp";

// handle the request for CGN Otp code generation
export function* cgnGenerateOtp(
  generateOtp: ReturnType<typeof BackendCGN>["generateOtp"]
) {
  try {
    const generateOtpResult: SagaCallReturnType<typeof generateOtp> =
      yield* call(generateOtp, {});
    if (E.isRight(generateOtpResult)) {
      if (generateOtpResult.right.status === 200) {
        yield* put(cgnGenerateOtpAction.success(generateOtpResult.right.value));
      } else {
        yield* put(
          cgnGenerateOtpAction.failure(
            getNetworkError(
              new Error(`response status ${generateOtpResult.right.status}`)
            )
          )
        );
      }
    } else {
      yield* put(
        cgnGenerateOtpAction.failure(
          getNetworkError(
            new Error(readablePrivacyReport(generateOtpResult.left))
          )
        )
      );
    }
  } catch (e) {
    yield* put(cgnGenerateOtpAction.failure(getNetworkError(e)));
  }
}

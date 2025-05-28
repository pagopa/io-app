import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnGenerateOtp as cgnGenerateOtpAction } from "../../../store/actions/otp";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";
import { setMerchantDiscountCode } from "../../../store/actions/merchants";

// handle the request for CGN Otp code generation
export function* cgnGenerateOtp(
  generateOtp: ReturnType<typeof BackendCGN>["generateOtp"],
  action: ActionType<(typeof cgnGenerateOtpAction)["request"]>
) {
  try {
    const generateOtpRequest = generateOtp({});
    const generateOtpResult = (yield* call(
      withRefreshApiCall,
      generateOtpRequest,
      action
    )) as unknown as SagaCallReturnType<typeof generateOtp>;
    if (E.isRight(generateOtpResult)) {
      if (generateOtpResult.right.status === 200) {
        yield* put(cgnGenerateOtpAction.success(generateOtpResult.right.value));
        yield* put(setMerchantDiscountCode(generateOtpResult.right.value.code));
        action.payload.onSuccess();
      } else if (generateOtpResult.right.status !== 401) {
        yield* put(
          cgnGenerateOtpAction.failure(
            getNetworkError(
              new Error(`response status ${generateOtpResult.right.status}`)
            )
          )
        );
        action.payload.onError();
      }
    } else {
      yield* put(
        cgnGenerateOtpAction.failure(
          getNetworkError(
            new Error(readablePrivacyReport(generateOtpResult.left))
          )
        )
      );
      action.payload.onError();
    }
  } catch (e) {
    yield* put(cgnGenerateOtpAction.failure(getNetworkError(e)));
    action.payload.onError();
  }
}

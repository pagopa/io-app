import { call, put } from "redux-saga/effects";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import { cgnCodeFromBucket } from "../../../store/actions/bucket";

// handle the request for CGN bucket consumption
export function* cgnBucketConsuption(
  getDiscountBucketCode: ReturnType<
    typeof BackendCgnMerchants
  >["getDiscountBucketCode"],
  cgnCodeFromBucketRequest: ReturnType<typeof cgnCodeFromBucket["request"]>
) {
  try {
    const discountBucketCodeResult: SagaCallReturnType<
      typeof getDiscountBucketCode
    > = yield call(getDiscountBucketCode, {
      discountId: cgnCodeFromBucketRequest.payload
    });
    if (discountBucketCodeResult.isRight()) {
      if (discountBucketCodeResult.value.status === 200) {
        yield put(
          cgnCodeFromBucket.success(discountBucketCodeResult.value.value)
        );
        return;
      } else {
        throw new Error(
          `response status ${discountBucketCodeResult.value.status}`
        );
      }
    }

    throw new Error(readablePrivacyReport(discountBucketCodeResult.value));
  } catch (e) {
    yield put(cgnCodeFromBucket.failure(getNetworkError(e)));
  }
}

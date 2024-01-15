import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import { cgnCodeFromBucket } from "../../../store/actions/bucket";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";

// handle the request for CGN bucket consumption
export function* cgnBucketConsuption(
  getDiscountBucketCode: ReturnType<
    typeof BackendCgnMerchants
  >["getDiscountBucketCode"],
  cgnCodeFromBucketRequest: ReturnType<(typeof cgnCodeFromBucket)["request"]>
) {
  try {
    const discountBacketRequest = getDiscountBucketCode({
      discountId: cgnCodeFromBucketRequest.payload
    });
    const discountBucketCodeResult = (yield* call(
      withRefreshApiCall,
      discountBacketRequest,
      cgnCodeFromBucketRequest
    )) as unknown as SagaCallReturnType<typeof getDiscountBucketCode>;
    if (E.isRight(discountBucketCodeResult)) {
      if (discountBucketCodeResult.right.status === 200) {
        yield* put(
          cgnCodeFromBucket.success({
            kind: "success",
            value: discountBucketCodeResult.right.value
          })
        );
        return;
      }
      if (discountBucketCodeResult.right.status === 404) {
        yield* put(
          cgnCodeFromBucket.success({
            kind: "notFound"
          })
        );
        return;
      } else {
        yield* put(
          cgnCodeFromBucket.success({
            kind: "unhandled"
          })
        );
        return;
      }
    }

    throw new Error(readablePrivacyReport(discountBucketCodeResult.left));
  } catch (e) {
    yield* put(cgnCodeFromBucket.failure(getNetworkError(e)));
  }
}

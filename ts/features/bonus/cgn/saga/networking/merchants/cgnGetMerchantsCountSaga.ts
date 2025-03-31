import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import {
  cgnMerchantsCount,
  cgnSearchMerchants
} from "../../../store/actions/merchants";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";

export function* cgnGetMerchantsCountSaga(
  getMerchantsCount: ReturnType<
    typeof BackendCgnMerchants
  >["getMerchantsCount"],
  cgnGetMerchantCountRequest: ReturnType<typeof cgnMerchantsCount.request>
) {
  try {
    const getMerchantsCountRequest = getMerchantsCount({
      body: cgnGetMerchantCountRequest.payload
    });
    const getMerchantsCountResult = (yield* call(
      withRefreshApiCall,
      getMerchantsCountRequest
    )) as unknown as SagaCallReturnType<typeof getMerchantsCount>;

    if (E.isLeft(getMerchantsCountResult)) {
      yield* put(
        cgnMerchantsCount.failure(
          getGenericError(
            new Error(readableReport(getMerchantsCountResult.left))
          )
        )
      );
      return;
    }

    if (getMerchantsCountResult.right.status === 200) {
      yield* put(
        cgnMerchantsCount.success(getMerchantsCountResult.right.value)
      );
      return;
    }

    if (getMerchantsCountResult.right.status === 401) {
      return;
    }

    throw new Error(
      `Response in status ${getMerchantsCountResult.right.status}`
    );
  } catch (e) {
    yield* put(cgnSearchMerchants.failure(getNetworkError(e)));
  }
}

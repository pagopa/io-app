import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import { cgnOnlineMerchants } from "../../../store/actions/merchants";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";

export function* cgnOnlineMerchantsSaga(
  getOnlineMerchants: ReturnType<
    typeof BackendCgnMerchants
  >["getOnlineMerchants"],
  cgnOnlineMerchantRequest: ReturnType<typeof cgnOnlineMerchants.request>
) {
  try {
    const onlineMerchantsRequest = getOnlineMerchants({
      body: cgnOnlineMerchantRequest.payload
    });
    const onlineMerchantsResult = (yield* call(
      withRefreshApiCall,
      onlineMerchantsRequest,
      cgnOnlineMerchantRequest
    )) as unknown as SagaCallReturnType<typeof getOnlineMerchants>;

    if (E.isLeft(onlineMerchantsResult)) {
      yield* put(
        cgnOnlineMerchants.failure(
          getGenericError(new Error(readableReport(onlineMerchantsResult.left)))
        )
      );
      return;
    }

    if (onlineMerchantsResult.right.status === 200) {
      yield* put(
        cgnOnlineMerchants.success(onlineMerchantsResult.right.value.items)
      );
      return;
    }
    if (onlineMerchantsResult.right.status === 401) {
      return;
    }

    throw new Error(`Response in status ${onlineMerchantsResult.right.status}`);
  } catch (e) {
    yield* put(cgnOnlineMerchants.failure(getNetworkError(e)));
  }
}

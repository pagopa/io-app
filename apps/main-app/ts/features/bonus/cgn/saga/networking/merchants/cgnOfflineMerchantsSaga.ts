import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import { cgnOfflineMerchants } from "../../../store/actions/merchants";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";

export function* cgnOfflineMerchantsSaga(
  getOfflineMerchants: ReturnType<
    typeof BackendCgnMerchants
  >["getOfflineMerchants"],
  cgnOfflineMerchantRequest: ReturnType<typeof cgnOfflineMerchants.request>
) {
  try {
    const offlineMerchantRequest = getOfflineMerchants({
      body: cgnOfflineMerchantRequest.payload
    });
    const offlineMerchantsResult = (yield* call(
      withRefreshApiCall,
      offlineMerchantRequest,
      cgnOfflineMerchantRequest
    )) as unknown as SagaCallReturnType<typeof getOfflineMerchants>;

    if (E.isLeft(offlineMerchantsResult)) {
      yield* put(
        cgnOfflineMerchants.failure(
          getGenericError(
            new Error(readableReport(offlineMerchantsResult.left))
          )
        )
      );
      return;
    }

    if (offlineMerchantsResult.right.status === 200) {
      yield* put(
        cgnOfflineMerchants.success(offlineMerchantsResult.right.value.items)
      );
      return;
    }
    if (offlineMerchantsResult.right.status === 401) {
      return;
    }

    throw new Error(
      `Response in status ${offlineMerchantsResult.right.status}`
    );
  } catch (e) {
    yield* put(cgnOfflineMerchants.failure(getNetworkError(e)));
  }
}

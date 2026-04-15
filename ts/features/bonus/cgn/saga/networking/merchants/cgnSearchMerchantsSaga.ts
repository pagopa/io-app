import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import { cgnSearchMerchants } from "../../../store/actions/merchants";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";

export function* cgnSearchMerchantsSaga(
  searchMerchants: ReturnType<typeof BackendCgnMerchants>["searchMerchants"],
  cgnSearchMerchantRequest: ReturnType<typeof cgnSearchMerchants.request>
) {
  try {
    const searchMerchantsRequest = searchMerchants({
      body: cgnSearchMerchantRequest.payload
    });
    const searchMerchantsResult = (yield* call(
      withRefreshApiCall,
      searchMerchantsRequest,
      cgnSearchMerchantRequest
    )) as unknown as SagaCallReturnType<typeof searchMerchants>;

    if (E.isLeft(searchMerchantsResult)) {
      yield* put(
        cgnSearchMerchants.failure(
          getGenericError(new Error(readableReport(searchMerchantsResult.left)))
        )
      );
      return;
    }

    if (searchMerchantsResult.right.status === 200) {
      yield* put(
        cgnSearchMerchants.success(searchMerchantsResult.right.value.items)
      );
      return;
    }

    if (searchMerchantsResult.right.status === 401) {
      return;
    }

    throw new Error(`Response in status ${searchMerchantsResult.right.status}`);
  } catch (e) {
    yield* put(cgnSearchMerchants.failure(getNetworkError(e)));
  }
}

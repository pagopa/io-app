import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import { cgnSelectedMerchant } from "../../../store/actions/merchants";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";

export function* cgnMerchantDetail(
  getMerchant: ReturnType<typeof BackendCgnMerchants>["getMerchant"],
  merchantSelected: ReturnType<(typeof cgnSelectedMerchant)["request"]>
) {
  try {
    const merchantDetailRequest = getMerchant({
      merchantId: merchantSelected.payload
    });
    const merchantDetailResult = (yield* call(
      withRefreshApiCall,
      merchantDetailRequest,
      merchantSelected
    )) as unknown as SagaCallReturnType<typeof getMerchant>;
    if (E.isLeft(merchantDetailResult)) {
      yield* put(
        cgnSelectedMerchant.failure(
          getGenericError(new Error(readableReport(merchantDetailResult.left)))
        )
      );
      return;
    }

    if (merchantDetailResult.right.status === 200) {
      yield* put(cgnSelectedMerchant.success(merchantDetailResult.right.value));
      return;
    }

    if (merchantDetailResult.right.status === 401) {
      return;
    }

    throw new Error(`Response in status ${merchantDetailResult.right.status}`);
  } catch (e) {
    yield* put(cgnSelectedMerchant.failure(getNetworkError(e)));
  }
}

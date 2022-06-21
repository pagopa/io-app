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
  cgnOfflineMerchants,
  cgnOnlineMerchants,
  cgnSelectedMerchant
} from "../../../store/actions/merchants";

export function* cgnOnlineMerchantsSaga(
  getOnlineMerchants: ReturnType<
    typeof BackendCgnMerchants
  >["getOnlineMerchants"],
  cgnOnlineMerchantRequest: ReturnType<typeof cgnOnlineMerchants.request>
) {
  try {
    const onlineMerchantsResult: SagaCallReturnType<typeof getOnlineMerchants> =
      yield* call(getOnlineMerchants, {
        body: cgnOnlineMerchantRequest.payload
      });

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

    throw new Error(`Response in status ${onlineMerchantsResult.right.status}`);
  } catch (e) {
    yield* put(cgnOnlineMerchants.failure(getNetworkError(e)));
  }
}

export function* cgnOfflineMerchantsSaga(
  getOfflineMerchants: ReturnType<
    typeof BackendCgnMerchants
  >["getOfflineMerchants"],
  cgnOfflineMerchantRequest: ReturnType<typeof cgnOfflineMerchants.request>
) {
  try {
    const offlineMerchantsResult: SagaCallReturnType<
      typeof getOfflineMerchants
    > = yield* call(getOfflineMerchants, {
      body: cgnOfflineMerchantRequest.payload
    });

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

    throw new Error(
      `Response in status ${offlineMerchantsResult.right.status}`
    );
  } catch (e) {
    yield* put(cgnOfflineMerchants.failure(getNetworkError(e)));
  }
}

export function* cgnMerchantDetail(
  getMerchant: ReturnType<typeof BackendCgnMerchants>["getMerchant"],
  merchantSelected: ReturnType<typeof cgnSelectedMerchant["request"]>
) {
  try {
    const merchantDetailResult: SagaCallReturnType<typeof getMerchant> =
      yield* call(getMerchant, { merchantId: merchantSelected.payload });
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

    throw new Error(`Response in status ${merchantDetailResult.right.status}`);
  } catch (e) {
    yield* put(cgnSelectedMerchant.failure(getNetworkError(e)));
  }
}

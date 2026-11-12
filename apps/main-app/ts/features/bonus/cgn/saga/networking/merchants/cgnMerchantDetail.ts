import { Merchant } from "@io-app/api-types/generated/definitions/cgn/merchants/Merchant";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { endOfDay, startOfDay } from "date-fns";
import { call, put, race, take } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import {
  CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS,
  cgnFeaturedOpportunities,
  cgnSelectedMerchant,
  cgnSelectedMerchantCancel,
  ResolvedCgnFeaturedOpportunity
} from "../../../store/actions/merchants";

export function* cgnFeaturedOpportunitiesSaga(
  getMerchant: ReturnType<typeof BackendCgnMerchants>["getMerchant"],
  request: ReturnType<typeof cgnFeaturedOpportunities.request>
) {
  const merchants = new Map<string, Merchant | undefined>();
  const opportunities = new Map<string, ResolvedCgnFeaturedOpportunity>();
  const today = new Date();
  for (const reference of request.payload.slice(
    0,
    CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS
  )) {
    if (!merchants.has(reference.merchantId)) {
      merchants.set(reference.merchantId, undefined);
      try {
        const response = (yield* call(
          withRefreshApiCall,
          getMerchant({ merchantId: reference.merchantId }),
          request
        )) as unknown as SagaCallReturnType<typeof getMerchant>;
        if ("right" in response && response.right.status === 401) {
          return;
        }
        if ("right" in response && response.right.status === 200) {
          merchants.set(reference.merchantId, response.right.value);
        }
      } catch {
        continue;
      }
    }
    const merchant = merchants.get(reference.merchantId);
    const discount = merchant?.discounts.find(
      item =>
        item.id === reference.discountId &&
        item.startDate <= endOfDay(today) &&
        item.endDate >= startOfDay(today)
    );
    if (merchant && discount) {
      opportunities.set(`${merchant.id}-${discount.id}`, {
        merchant,
        discount
      });
    }
  }
  yield* put(
    cgnFeaturedOpportunities.success(Array.from(opportunities.values()))
  );
}

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
    if ("left" in merchantDetailResult) {
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

/**
 * Runs `cgnMerchantDetail` until it completes or a featured selection cancels
 * it
 */
export function* cgnMerchantDetailUntilCancelled(
  getMerchant: ReturnType<typeof BackendCgnMerchants>["getMerchant"],
  merchantSelected: ReturnType<(typeof cgnSelectedMerchant)["request"]>
) {
  yield* race({
    detail: call(cgnMerchantDetail, getMerchant, merchantSelected),
    cancelled: take(getType(cgnSelectedMerchantCancel))
  });
}

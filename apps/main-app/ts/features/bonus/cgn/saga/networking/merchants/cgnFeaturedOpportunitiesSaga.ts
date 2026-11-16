import { Merchant } from "@io-app/api-types/generated/definitions/cgn/merchants/Merchant";
import { endOfDay, startOfDay } from "date-fns";
import { call, put } from "typed-redux-saga/macro";

import { SagaCallReturnType } from "../../../../../../types/utils";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import {
  CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS,
  cgnFeaturedOpportunities,
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

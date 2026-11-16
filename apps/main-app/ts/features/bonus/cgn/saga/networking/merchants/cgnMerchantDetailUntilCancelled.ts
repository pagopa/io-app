import { call, race, take } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";

import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import {
  cgnSelectedMerchant,
  selectFeaturedOpportunity
} from "../../../store/actions/merchants";
import { cgnMerchantDetail } from "./cgnMerchantDetail";

export function* cgnMerchantDetailUntilCancelled(
  getMerchant: ReturnType<typeof BackendCgnMerchants>["getMerchant"],
  merchantSelected: ReturnType<(typeof cgnSelectedMerchant)["request"]>
) {
  yield* race({
    detail: call(cgnMerchantDetail, getMerchant, merchantSelected),
    cancelled: take(getType(selectFeaturedOpportunity))
  });
}

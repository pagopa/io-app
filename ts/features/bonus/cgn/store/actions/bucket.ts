import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { DiscountBucketCode } from "../../../../../../definitions/cgn/merchants/DiscountBucketCode";

/**
 * handle CGN discount code consumption from a bucket
 */
export const cgnCodeFromBucket = createAsyncAction(
  "CGN_BUCKET_CODE_REQUEST",
  "CGN_BUCKET_CODE_SUCCESS",
  "CGN_BUCKET_CODE_FAILURE"
  // TODO Type string for request action is only temporary need to use a discountId
)<string, DiscountBucketCode, NetworkError>();

export type CgnBucketActions = ActionType<typeof cgnCodeFromBucket>;

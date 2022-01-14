import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { DiscountBucketCodeResponse, } from "../../types/DiscountBucketCodeResponse";

/**
 * handle CGN discount code consumption from a bucket
 */
export const cgnCodeFromBucket = createAsyncAction(
  "CGN_BUCKET_CODE_REQUEST",
  "CGN_BUCKET_CODE_SUCCESS",
  "CGN_BUCKET_CODE_FAILURE"
)<Discount["id"], DiscountBucketCodeResponse, NetworkError>();

export type CgnBucketActions = ActionType<typeof cgnCodeFromBucket>;

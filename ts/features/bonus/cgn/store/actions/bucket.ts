import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { DiscountBucketCodeResponse } from "../../types/DiscountBucketCodeResponse";

/**
 * handle CGN discount code consumption from a bucket
 */
export const cgnCodeFromBucket = createAsyncAction(
  "CGN_BUCKET_CODE_REQUEST",
  "CGN_BUCKET_CODE_SUCCESS",
  "CGN_BUCKET_CODE_FAILURE"
)<Discount["id"], DiscountBucketCodeResponse, NetworkError>();

export const cgnCodeFromBucketReset = createStandardAction(
  "CGN_BUCKET_CODE_RESET"
)<void>();

export type CgnBucketActions =
  | ActionType<typeof cgnCodeFromBucket>
  | ActionType<typeof cgnCodeFromBucketReset>;

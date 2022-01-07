import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";

// TODO This type is related to the api spec still not available
// will be replaced once https://github.com/pagopa/io-functions-cgn-operator-search/pull/32 will be merged
// and the spec will be referred by io-backend
export type DiscountBucketCode = {
  code: string;
};

/**
 * handle CGN discount code consumption from a bucket
 */
export const cgnCodeFromBucket = createAsyncAction(
  "CGN_BUCKET_CODE_REQUEST",
  "CGN_BUCKET_CODE_SUCCESS",
  "CGN_BUCKET_CODE_FAILURE"
)<void, DiscountBucketCode, NetworkError>();

export type CgnBucketActions = ActionType<typeof cgnCodeFromBucket>;

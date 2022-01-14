import { DiscountBucketCode } from "../../../../../definitions/cgn/merchants/DiscountBucketCode";

/**
 * Type representing service preference successfully loaded
 */
type DiscountBucketCodeResponseSuccess = {
  kind: "success";
  value: DiscountBucketCode;
};

/**
 * Type representing service preference successfully loaded
 */
type DiscountBucketCodeNotFound = {
  kind: "notFound";
};

/**
 * Type representing service preference successfully loaded
 */
type DiscountBucketCodeUnhandled = {
  kind: "unhandled";
};

type DiscountBucketCodeResponseFailure =
  | DiscountBucketCodeNotFound
  | DiscountBucketCodeUnhandled;

/**
 * Type representing all handled responses from backend
 */
export type DiscountBucketCodeResponse =
  | DiscountBucketCodeResponseSuccess
  | DiscountBucketCodeResponseFailure;

export const isDiscountBucketCodeResponseSuccess = (
  dbc: DiscountBucketCodeResponse
): dbc is DiscountBucketCodeResponseSuccess => dbc.kind === "success";

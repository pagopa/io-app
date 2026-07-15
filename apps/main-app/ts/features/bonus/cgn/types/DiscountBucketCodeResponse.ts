import { DiscountBucketCode } from "../../../../../definitions/cgn/merchants/DiscountBucketCode";

/**
 * Type representing all handled responses from backend
 */
export type DiscountBucketCodeResponse =
  | DiscountBucketCodeResponseFailure
  | DiscountBucketCodeResponseSuccess;

/**
 * Type representing that there's no bucket code available
 */
type DiscountBucketCodeNotFound = {
  kind: "notFound";
};

type DiscountBucketCodeResponseFailure =
  | DiscountBucketCodeNotFound
  | DiscountBucketCodeUnhandled;

/**
 * Type representing bucket code successfully loaded
 */
type DiscountBucketCodeResponseSuccess = {
  kind: "success";
  value: DiscountBucketCode;
};

/**
 * Type representing any other error specified by backend response without the need to be handled by the app
 */
type DiscountBucketCodeUnhandled = {
  kind: "unhandled";
};

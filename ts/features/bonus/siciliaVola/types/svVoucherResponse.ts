import { SvVoucher } from "./svVoucher";

export type SvVoucherGeneratedResponseSuccess = {
  kind: "success";
  value: SvVoucher;
};

/**
 * The required voucher request goes into timeout
 */
export type SvVoucherGeneratedResponseTimeout = {
  kind: "timeout";
};

/**
 * This type represents all the possible remote responses
 */
export type SvVoucherGeneratedResponse =
  | SvVoucherGeneratedResponseSuccess
  | SvVoucherGeneratedResponseTimeout;

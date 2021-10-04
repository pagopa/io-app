import { SvVoucher, SvVoucherId } from "./SvVoucher";

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

export type SvVoucherGeneratedResponseFailure =
  SvVoucherGeneratedResponseTimeout;

/**
 * This type represents all the possible remote responses
 */
export type SvVoucherGeneratedResponse =
  | SvVoucherGeneratedResponseSuccess
  | SvVoucherGeneratedResponseFailure;

export type VoucherPreview = {
  idVoucher: SvVoucherId;
  departureDate: Date;
  returnDate?: Date;
  destination: string;
};
export type SvVoucherListResponse = ReadonlyArray<VoucherPreview>;

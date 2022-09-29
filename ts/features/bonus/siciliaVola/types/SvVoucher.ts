import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { AvailableDestinations, VoucherRequest } from "./SvVoucherRequest";

/**
 * The unique ID of a SiciliaVola Voucher
 */
export type SvVoucherId = number & IUnitTag<"SvVoucherId">;

type WithSvVoucherId = {
  id: SvVoucherId;
};

type QRCode = string;

type BarCode = string;

/**
 * This type represents the Sv Voucher
 */
export type SvVoucher = WithSvVoucherId &
  VoucherRequest & {
    beneficiary: string;
    qrCode: QRCode;
    barCode: BarCode;
    availableDestination: AvailableDestinations;
  };

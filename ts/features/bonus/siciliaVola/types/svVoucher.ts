import { IUnitTag } from "italia-ts-commons/lib/units";
import { AvailableDestinations, VoucherRequest } from "./SvVoucherRequest";

/**
 * The unique ID of a SiciliaVola Voucher
 */
export type SvVoucherId = string & IUnitTag<"SvVoucherId">;

type WithSvVoucherId = {
  id: SvVoucherId;
};

type QRCode = {
  mimeType: "image/png" | "image/svg";
  content: string;
};

type BarCode = {
  mimeType: "image/png" | "image/svg";
  content: string;
};

/**
 * This type represents the Sv Voucher
 */
export type SvVoucher = WithSvVoucherId &
  VoucherRequest & {
    beneficiary: string;
    qrCode: ReadonlyArray<QRCode>;
    barCode: ReadonlyArray<BarCode>;
    availableDestination: AvailableDestinations;
  };

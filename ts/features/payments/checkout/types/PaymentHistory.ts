export type PaymentStartOrigin =
  | "message"
  | "qrcode_scan"
  | "poste_datamatrix_scan"
  | "manual_insertion"
  | "donation";

export type PaymentHistory = {
  startOrigin?: PaymentStartOrigin;
};

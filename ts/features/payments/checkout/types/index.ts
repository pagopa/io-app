export type WalletPaymentPspSortType = "default" | "name" | "amount";

export type PaymentStartOrigin =
  | "message"
  | "qrcode_scan"
  | "poste_datamatrix_scan"
  | "manual_insertion"
  | "donation";

export enum WalletPaymentStepEnum {
  NONE = 0,
  PICK_PAYMENT_METHOD = 1,
  PICK_PSP = 2,
  CONFIRM_TRANSACTION = 3
}

export type TextInputValidationRefProps = { validateInput: () => void };

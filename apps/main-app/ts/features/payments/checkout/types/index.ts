export enum WalletPaymentStepEnum {
  NONE = 0,
  PICK_PAYMENT_METHOD = 1,
  PICK_PSP = 2,
  CONFIRM_TRANSACTION = 3
}

export type PaymentStartOrigin =
  | "donation"
  | "manual_insertion"
  | "message"
  | "poste_datamatrix_scan"
  | "qrcode_scan";

export type TextInputValidationRefProps = { validateInput: () => void };

export type WalletPaymentPspSortType = "amount" | "default" | "name";

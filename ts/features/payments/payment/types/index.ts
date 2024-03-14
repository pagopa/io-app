import { NavigatorScreenParams } from "@react-navigation/native";
import { AppParamsList } from "../../../../navigation/params/AppParamsList";

export type WalletPaymentPspSortType = "default" | "name" | "amount";

export type PaymentStartOrigin =
  | "message"
  | "qrcode_scan"
  | "poste_datamatrix_scan"
  | "manual_insertion"
  | "donation";

export type PaymentStartRoute = {
  routeName: keyof AppParamsList;
  routeKey: NavigatorScreenParams<AppParamsList>["screen"];
};

export enum WalletPaymentStepEnum {
  NONE = 0,
  PICK_PAYMENT_METHOD = 1,
  PICK_PSP = 2,
  CONFIRM_TRANSACTION = 3
}

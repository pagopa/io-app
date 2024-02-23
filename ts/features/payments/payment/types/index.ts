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

import { NavigatorScreenParams } from "@react-navigation/native";
import { AppParamsList } from "../../../../navigation/params/AppParamsList";

export type { WalletPaymentPspSortType } from "./WalletPaymentPspSortType";
export type { PaymentStartOrigin, PaymentHistory } from "./PaymentHistory";

export type PaymentStartRoute = {
  routeName: keyof AppParamsList;
  routeKey: NavigatorScreenParams<AppParamsList>["screen"];
};

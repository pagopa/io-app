import { PaymentsMethodDetailsScreenNavigationParams } from "../screens/PaymentsMethodDetailsScreen";
import { PaymentsMethodDetailsRoutes } from "./routes";

export type PaymentsMethodDetailsParamsList = {
  [PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR]: undefined;
  [PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN]: PaymentsMethodDetailsScreenNavigationParams;
};

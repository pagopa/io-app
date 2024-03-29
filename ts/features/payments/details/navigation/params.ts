import { PaymentsMethodDetailsScreenNavigationParams } from "../screens/PaymentsMethodDetailsScreen";
import { PaymentsMethodDetailsRoutes } from "./routes";

export type PaymentsMethodDetailsParamsList = {
  [PaymentsMethodDetailsRoutes.PAYMENTS_METHOD_DETAILS_NAVIGATOR]: undefined;
  [PaymentsMethodDetailsRoutes.PAYMENTS_METHOD_DETAILS_SCREEN]: PaymentsMethodDetailsScreenNavigationParams;
};

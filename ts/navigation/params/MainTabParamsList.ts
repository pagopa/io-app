import { WalletHomeNavigationParams } from "../../screens/wallet/WalletHomeScreen";
import ROUTES from "../routes";

export type MainTabParamsList = {
  [ROUTES.MESSAGES_HOME]: undefined;
  [ROUTES.WALLET_HOME]: WalletHomeNavigationParams;
  [ROUTES.PAYMENT_SCAN_QR_CODE]: undefined;
  [ROUTES.SERVICES_HOME]: undefined;
  [ROUTES.PROFILE_MAIN]: undefined;
};

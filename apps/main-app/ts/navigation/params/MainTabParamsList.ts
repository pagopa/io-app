import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";
import { SERVICES_ROUTES } from "../../features/services/common/navigation/routes";
import { WalletHomeNavigationParams } from "../../features/wallet/screens/WalletHomeScreen";
import ROUTES from "../routes";

export type MainTabParamsList = {
  [MESSAGES_ROUTES.MESSAGES_HOME]: undefined;
  [ROUTES.BARCODE_SCAN_TAB_EMPTY]: undefined;
  [ROUTES.PAYMENTS_HOME]: undefined;
  [ROUTES.WALLET_HOME]: WalletHomeNavigationParams;
  [SERVICES_ROUTES.SERVICES_HOME]: undefined;
};

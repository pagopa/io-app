import { WalletHomeNavigationParams } from "../../screens/wallet/WalletHomeScreen";
import ROUTES from "../routes";
import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";

export type MainTabParamsList = {
  [MESSAGES_ROUTES.MESSAGES_HOME]: undefined;
  [ROUTES.WALLET_HOME]: WalletHomeNavigationParams;
  [ROUTES.BARCODE_SCAN]: undefined;
  [ROUTES.SERVICES_HOME]: undefined;
  [ROUTES.PROFILE_MAIN]: undefined;
};

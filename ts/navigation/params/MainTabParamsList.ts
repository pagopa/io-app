import { ProfileMainNavigationParams } from "../../screens/profile/ProfileMainScreen";
import { WalletHomeNavigationParams } from "../../screens/wallet/WalletHomeScreen";
import ROUTES from "../routes";

export type MainTabParamsList = {
  [ROUTES.ITWALLET_HOME]: undefined;
  [ROUTES.QR_CODE_SCAN]: undefined;
  [ROUTES.MESSAGES_HOME]: undefined;
  [ROUTES.WALLET_HOME]: WalletHomeNavigationParams;
  [ROUTES.BARCODE_SCAN]: undefined;
  [ROUTES.SERVICES_HOME]: undefined;
  [ROUTES.PROFILE_MAIN]: ProfileMainNavigationParams;
};

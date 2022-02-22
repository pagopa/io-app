import { WalletHomeNavigationParams } from "../../screens/wallet/WalletHomeScreen";
import ROUTES from "../routes";

export type MainParamsList = {
  [ROUTES.MESSAGES_HOME]: undefined;
  [ROUTES.WALLET_HOME]: WalletHomeNavigationParams;
  [ROUTES.SERVICES_HOME]: undefined;
  [ROUTES.PROFILE_MAIN]: undefined;
};

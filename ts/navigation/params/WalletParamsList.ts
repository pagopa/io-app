import { IdPayInstrumentInitiativesScreenRouteParams } from "../../features/idpay/wallet/screens/IdPayInstrumentInitiativesScreen";
import ROUTES from "../routes";
import { BONUS_ROUTES } from "../../features/bonus/common/navigation/navigator";

export type WalletParamsList = {
  [ROUTES.WALLET_HOME]: undefined;
  [ROUTES.WALLET_IDPAY_INITIATIVE_LIST]: IdPayInstrumentInitiativesScreenRouteParams;

  [BONUS_ROUTES.MAIN]: undefined;
};

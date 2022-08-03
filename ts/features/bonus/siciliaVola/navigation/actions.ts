import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import SV_ROUTES from "./routes";

/**
 * @deprecated
 */
export const navigateToSvCheckStatusRouterScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS
    })
  );

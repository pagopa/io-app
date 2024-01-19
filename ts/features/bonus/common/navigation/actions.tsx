import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { BonusInformationScreenNavigationParams } from "../screens/BonusInformationScreen";
import { BONUS_ROUTES } from "./navigator";

export const navigateToAvailableBonusListScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BONUS_ROUTES.MAIN,
      params: {
        screen: BONUS_ROUTES.BONUS_AVAILABLE_LIST
      }
    })
  );
export const navigateToBonusRequestInformation = (
  params?: BonusInformationScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BONUS_ROUTES.MAIN,
      params: {
        screen: BONUS_ROUTES.BONUS_REQUEST_INFORMATION,
        params
      }
    })
  );

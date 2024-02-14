import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
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

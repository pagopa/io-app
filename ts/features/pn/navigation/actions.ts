import { CommonActions } from "@react-navigation/native";
import ROUTES from "../../../navigation/routes";
import { PnMessageDetailsScreenNavigationParams } from "../screens/PnMessageDetailsScreen";
import PN_ROUTES from "./routes";

export const navigateToPnMessageDetailsScreen = (
  params: PnMessageDetailsScreenNavigationParams
) =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: PN_ROUTES.MAIN,
    params: {
      screen: PN_ROUTES.MESSAGE_DETAILS,
      params
    }
  });

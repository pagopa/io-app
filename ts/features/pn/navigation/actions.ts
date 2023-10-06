import { CommonActions } from "@react-navigation/native";
import ROUTES from "../../../navigation/routes";
import { PnMessageDetailsScreenNavigationParams } from "../screens/PnMessageDetailsScreen";
import { PnPaidPaymentScreenNavigationParams } from "../screens/PnPaidPaymentScreen";
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

export const navigateToPnCancelledMessagePaidPaymentScreen = (
  params: PnPaidPaymentScreenNavigationParams
) =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: PN_ROUTES.MAIN,
    params: {
      screen: PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT,
      params
    }
  });

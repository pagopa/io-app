import { CommonActions } from "@react-navigation/native";
import ROUTES from "../../../navigation/routes";
import { MessageDetailsScreenNavigationParams } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreenNavigationParams } from "../screens/PaidPaymentScreen";
import PN_ROUTES from "./routes";

export const navigateToPnMessageDetailsScreen = (
  params: MessageDetailsScreenNavigationParams
) =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: PN_ROUTES.MAIN,
    params: {
      screen: PN_ROUTES.MESSAGE_DETAILS,
      params
    }
  });

export const navigateToPnCancelledMessagePaidPaymentScreen = (
  params: PaidPaymentScreenNavigationParams
) =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: PN_ROUTES.MAIN,
    params: {
      screen: PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT,
      params
    }
  });

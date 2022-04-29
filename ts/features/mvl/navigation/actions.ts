import { CommonActions } from "@react-navigation/native";
import ROUTES from "../../../navigation/routes";
import { MvlRouterScreenNavigationParams } from "../screens/MvlRouterScreen";
import MVL_ROUTES from "./routes";

export const navigateToMvlDetailsScreen = (
  params: MvlRouterScreenNavigationParams
) =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: MVL_ROUTES.MAIN,
    params: {
      screen: MVL_ROUTES.DETAILS,
      params
    }
  });

export const navigateToMvlCertificatesScreen = () =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: MVL_ROUTES.MAIN,
    params: {
      screen: MVL_ROUTES.CERTIFICATES
    }
  });

export const navigateToMvlRecipientsScreen = () =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: MVL_ROUTES.MAIN,
    params: {
      screen: MVL_ROUTES.RECIPIENTS
    }
  });

export const navigateToMvlSignatureScreen = () =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: MVL_ROUTES.MAIN,
    params: {
      screen: MVL_ROUTES.SIGNATURE
    }
  });

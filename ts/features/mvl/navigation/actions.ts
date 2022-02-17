import { NavigationActions } from "@react-navigation/compat";
import { MvlRouterScreenNavigationParams } from "../screens/MvlRouterScreen";
import MVL_ROUTES from "./routes";

export const navigateToMvlDetailsScreen = (
  params: MvlRouterScreenNavigationParams
) =>
  NavigationActions.navigate({
    routeName: MVL_ROUTES.DETAILS,
    params
  });

export const navigateToMvlCertificatesScreen = () =>
  NavigationActions.navigate({
    routeName: MVL_ROUTES.CERTIFICATES
  });

export const navigateToMvlRecipientsScreen = () =>
  NavigationActions.navigate({
    routeName: MVL_ROUTES.RECIPIENTS
  });

export const navigateToMvlSignatureScreen = () =>
  NavigationActions.navigate({
    routeName: MVL_ROUTES.SIGNATURE
  });

import { NavigationActions } from "react-navigation";
import NavigationService from "../../../navigation/NavigationService";
import { InferNavigationParams } from "../../../types/react";
import EuCovidCertificateRouterScreen from "../screens/EuCovidCertificateRouterScreen";
import { EuCovidCertMarkdownDetailsScreen } from "../screens/valid/EuCovidCertMarkdownDetailsScreen";
import { EuCovidCertQrCodeFullScreen } from "../screens/valid/EuCovidCertQrCodeFullScreen";
import EUCOVIDCERT_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToEuCovidCertificateDetailScreen = (
  params: InferNavigationParams<typeof EuCovidCertificateRouterScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: EUCOVIDCERT_ROUTES.CERTIFICATE,
      params
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToEuCovidCertificateQrCodeFullScreen = (
  params: InferNavigationParams<typeof EuCovidCertQrCodeFullScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: EUCOVIDCERT_ROUTES.QRCODE,
      params
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToEuCovidCertificateMarkdownDetailsScreen = (
  params: InferNavigationParams<typeof EuCovidCertMarkdownDetailsScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: EUCOVIDCERT_ROUTES.MARKDOWN_DETAILS,
      params
    })
  );

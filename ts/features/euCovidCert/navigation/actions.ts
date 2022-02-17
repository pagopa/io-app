import { NavigationActions } from "@react-navigation/compat";
import NavigationService from "../../../navigation/NavigationService";
import { EuCovidCertificateRouterScreenNavigationParams } from "../screens/EuCovidCertificateRouterScreen";
import { EuCovidCertMarkdownDetailsScreenNavigationParams } from "../screens/valid/EuCovidCertMarkdownDetailsScreen";
import { EuCovidCertQrCodeFullScreenNavigationParams } from "../screens/valid/EuCovidCertQrCodeFullScreen";
import EUCOVIDCERT_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToEuCovidCertificateDetailScreen = (
  params: EuCovidCertificateRouterScreenNavigationParams
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
  params: EuCovidCertQrCodeFullScreenNavigationParams
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
  params: EuCovidCertMarkdownDetailsScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: EUCOVIDCERT_ROUTES.MARKDOWN_DETAILS,
      params
    })
  );

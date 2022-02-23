import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
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
    CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
      screen: EUCOVIDCERT_ROUTES.MAIN,
      params: {
        screen: EUCOVIDCERT_ROUTES.CERTIFICATE,
        params
      }
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
    CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
      screen: EUCOVIDCERT_ROUTES.MAIN,
      params: {
        screen: EUCOVIDCERT_ROUTES.QRCODE,
        params
      }
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
    CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
      screen: EUCOVIDCERT_ROUTES.MAIN,
      params: {
        screen: EUCOVIDCERT_ROUTES.MARKDOWN_DETAILS,
        params
      }
    })
  );

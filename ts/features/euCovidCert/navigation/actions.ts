import { NavigationActions } from "react-navigation";
import { InferNavigationParams } from "../../../types/react";
import EuCovidCertificateRouterScreen from "../screens/EuCovidCertificateRouterScreen";
import { EuCovidCertQrCodeFullScreen } from "../screens/EuCovidCertQrCodeFullScreen";
import EUCOVIDCERT_ROUTES from "./routes";

export const navigateToEuCovidCertificateDetailScreen = (
  params: InferNavigationParams<typeof EuCovidCertificateRouterScreen>
) =>
  NavigationActions.navigate({
    routeName: EUCOVIDCERT_ROUTES.DETAILS,
    params
  });

export const navigateToEuCovidCertificateQrCodeFullScreen = (
  params: InferNavigationParams<typeof EuCovidCertQrCodeFullScreen>
) =>
  NavigationActions.navigate({
    routeName: EUCOVIDCERT_ROUTES.QRCODE,
    params
  });

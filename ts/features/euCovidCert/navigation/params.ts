import { EuCovidCertificateRouterScreenNavigationParams } from "../screens/EuCovidCertificateRouterScreen";
import { EuCovidCertMarkdownDetailsScreenNavigationParams } from "../screens/valid/EuCovidCertMarkdownDetailsScreen";
import { EuCovidCertQrCodeFullScreenNavigationParams } from "../screens/valid/EuCovidCertQrCodeFullScreen";
import EUCOVIDCERT_ROUTES from "./routes";

export type EUCovidCertParamsList = {
  [EUCOVIDCERT_ROUTES.CERTIFICATE]: EuCovidCertificateRouterScreenNavigationParams;
  [EUCOVIDCERT_ROUTES.QRCODE]: EuCovidCertQrCodeFullScreenNavigationParams;
  [EUCOVIDCERT_ROUTES.MARKDOWN_DETAILS]: EuCovidCertMarkdownDetailsScreenNavigationParams;
};

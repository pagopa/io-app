import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import EuCovidCertificateRouterScreen from "../screens/EuCovidCertificateRouterScreen";
import { EuCovidCertMarkdownDetailsScreen } from "../screens/valid/EuCovidCertMarkdownDetailsScreen";
import { EuCovidCertQrCodeFullScreen } from "../screens/valid/EuCovidCertQrCodeFullScreen";
import EUCOVIDCERT_ROUTES from "./routes";

const EuCovidCertNavigator = createCompatNavigatorFactory(createStackNavigator)(
  {
    [EUCOVIDCERT_ROUTES.CERTIFICATE]: {
      screen: EuCovidCertificateRouterScreen
    },
    [EUCOVIDCERT_ROUTES.QRCODE]: {
      screen: EuCovidCertQrCodeFullScreen
    },
    [EUCOVIDCERT_ROUTES.MARKDOWN_DETAILS]: {
      screen: EuCovidCertMarkdownDetailsScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default EuCovidCertNavigator;

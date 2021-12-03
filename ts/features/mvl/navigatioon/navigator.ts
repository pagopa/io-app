import { createStackNavigator } from "react-navigation-stack";
import { MvlCertificatesScreen } from "../screens/metadata/MVLCertificatesScreen";
import { MvlRecipientsScreen } from "../screens/metadata/MvlRecipientsScreen";
import { MvlSignatureScreen } from "../screens/metadata/MvlSignatureScreen";
import { MvlRouterScreen } from "../screens/MVLRouterScreen";
import MVL_ROUTES from "./routes";

const MvlNavigator = createStackNavigator(
  {
    [MVL_ROUTES.DETAILS]: {
      screen: MvlRouterScreen
    },
    [MVL_ROUTES.CERTIFICATES]: {
      screen: MvlCertificatesScreen
    },
    [MVL_ROUTES.RECIPIENTS]: {
      screen: MvlRecipientsScreen
    },
    [MVL_ROUTES.SIGNATURE]: {
      screen: MvlSignatureScreen
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

export default MvlNavigator;

import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import { MvlCertificatesScreen } from "../screens/metadata/MvlCertificatesScreen";
import { MvlRecipientsScreen } from "../screens/metadata/MvlRecipientsScreen";
import { MvlSignatureScreen } from "../screens/metadata/MvlSignatureScreen";
import { MvlRouterScreen } from "../screens/MvlRouterScreen";
import { MvlAttachmentPreview } from "../screens/details/components/attachment/MvlAttachmentPreview";
import MVL_ROUTES from "./routes";

const MvlNavigator = createCompatNavigatorFactory(createStackNavigator)(
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
    },
    [MVL_ROUTES.ATTACHMENT]: {
      screen: MvlAttachmentPreview
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gestureEnabled: false
    }
  }
);

export default MvlNavigator;

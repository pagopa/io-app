import { createStackNavigator } from "react-navigation";

import ServicesHomeScreen from "../screens/services/ServicesHomeScreen";
import ROUTES from "./routes";

const ServicesNavigator = createStackNavigator(
  {
    [ROUTES.SERVICES_HOME]: {
      screen: ServicesHomeScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default ServicesNavigator;

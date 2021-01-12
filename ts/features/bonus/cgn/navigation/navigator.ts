import { createStackNavigator } from "react-navigation";

const CgnNavigator = createStackNavigator(
  {},
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default CgnNavigator;

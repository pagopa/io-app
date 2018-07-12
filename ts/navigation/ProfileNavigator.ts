import { createStackNavigator } from "react-navigation";

import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import ROUTES from "./routes";

const ProfileNavigator = createStackNavigator(
  {
    [ROUTES.PROFILE_MAIN]: {
      screen: ProfileMainScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default ProfileNavigator;

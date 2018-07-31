import { createStackNavigator } from "react-navigation";

import TosScreen from "../screens/onboarding/TosScreen";
import PrivacyMainScreen from "../screens/profile/PrivacyMainScreen";
import PrivacyScreen from "../screens/profile/PrivacyScreen";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import ROUTES from "./routes";

/**
 * A navigator for all the screens of the Profile section
 */
const ProfileNavigator = createStackNavigator(
  {
    [ROUTES.PROFILE_MAIN]: {
      screen: ProfileMainScreen
    },
    [ROUTES.PROFILE_PRIVACY_MAIN]: {
      screen: PrivacyMainScreen
    },
    [ROUTES.PROFILE_PRIVACY]: {
      screen: PrivacyScreen
    },
    [ROUTES.PROFILE_TOS]: {
      screen: TosScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default ProfileNavigator;

import { createStackNavigator } from "react-navigation";

import BiometricRecognitionScreen from "../screens/profile/BiometricRecognitionScreen";
import CalendarsPreferencesScreen from "../screens/profile/CalendarsPreferencesScreen";
import PreferencesScreen from "../screens/profile/PreferencesScreen";
import { PrivacyMainScreen } from "../screens/profile/PrivacyMainScreen";
import { PrivacyScreen } from "../screens/profile/PrivacyScreen";
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
    [ROUTES.PROFILE_PREFERENCES_HOME]: {
      screen: PreferencesScreen
    },
    [ROUTES.PROFILE_PREFERENCES_BIOMETRIC_RECOGNITION]: {
      screen: BiometricRecognitionScreen
    },
    [ROUTES.PROFILE_PREFERENCES_CALENDAR]: {
      screen: CalendarsPreferencesScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default ProfileNavigator;

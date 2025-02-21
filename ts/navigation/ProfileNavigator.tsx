import { createStackNavigator } from "@react-navigation/stack";
import LogoutScreen from "../components/screens/LogoutScreen";
import { DesignSystemNavigator } from "../features/design-system/navigation/navigator";
import LollipopPlayground from "../features/lollipop/playgrounds/LollipopPlayground";
import CalendarsPreferencesScreen from "../screens/profile/CalendarsPreferencesScreen";
import CgnLandingPlayground from "../screens/profile/CgnLandingPlayground";
import DownloadProfileDataScreen from "../screens/profile/DownloadProfileDataScreen";
import EmailForwardingScreen from "../screens/profile/EmailForwardingScreen";
import EmailInsertScreen from "../screens/profile/EmailInsertScreen";
import EmailValidationSendEmailScreen from "../screens/profile/EmailValidationSendEmailScreen";
import FiscalCodeScreen from "../screens/profile/FiscalCodeScreen";
import LanguagesPreferencesScreen from "../screens/profile/LanguagesPreferencesScreen";
import { NotificationsPreferencesScreen } from "../screens/profile/NotificationsPreferencesScreen";
import PinScreen from "../screens/profile/PinScreen";
import PreferencesScreen from "../screens/profile/PreferencesScreen";
import PrivacyMainScreen from "../screens/profile/PrivacyMainScreen";
import ProfileAboutApp from "../screens/profile/ProfileAboutApp";
import ProfileDataScreen from "../screens/profile/ProfileDataScreen";
import RemoveAccountDetails from "../screens/profile/RemoveAccountDetailsScreen";
import RemoveAccountInfo from "../screens/profile/RemoveAccountInfoScreen";
import RemoveAccountSuccess from "../screens/profile/RemoveAccountSuccessScreen";
import SecurityScreen from "../screens/profile/SecurityScreen";
import ServicesPreferenceScreen from "../screens/profile/ServicesPreferenceScreen";
import ShareDataScreen from "../screens/profile/ShareDataScreen";
import TosScreen from "../screens/profile/TosScreen";
import { IdPayCodePlayGround } from "../screens/profile/playgrounds/IdPayCodePlayground";
import IdPayOnboardingPlayground from "../screens/profile/playgrounds/IdPayOnboardingPlayground";
import { isGestureEnabled } from "../utils/navigation";
import TrialSystemPlayground from "../screens/profile/TrialSystemPlayground";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import { IOMarkdownPlayground } from "../screens/profile/playgrounds/IOMarkdownPlayground";
import { ProfileParamsList } from "./params/ProfileParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<ProfileParamsList>();

/**
 * A navigator for all the screens of the Profile section
 */
const ProfileStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.SETTINGS_MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      options={{ headerShown: true }}
      name={ROUTES.SETTINGS_MAIN}
      component={ProfileMainScreen}
    />
    <Stack.Screen name={ROUTES.PROFILE_DATA} component={ProfileDataScreen} />
    <Stack.Screen
      name={ROUTES.PROFILE_PRIVACY_MAIN}
      component={PrivacyMainScreen}
    />
    <Stack.Screen
      options={{ headerShown: true }}
      name={ROUTES.PROFILE_PRIVACY}
      component={TosScreen}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_PRIVACY_SHARE_DATA}
      component={ShareDataScreen}
    />
    <Stack.Screen name={ROUTES.PROFILE_SECURITY} component={SecurityScreen} />
    <Stack.Screen
      name={ROUTES.PROFILE_PREFERENCES_SERVICES}
      component={ServicesPreferenceScreen}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING}
      component={EmailForwardingScreen}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_PREFERENCES_HOME}
      component={PreferencesScreen}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_PREFERENCES_CALENDAR}
      component={CalendarsPreferencesScreen}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_PREFERENCES_LANGUAGE}
      component={LanguagesPreferencesScreen}
    />
    <Stack.Screen name={ROUTES.PROFILE_ABOUT_APP} component={ProfileAboutApp} />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={ROUTES.PROFILE_LOGOUT}
      component={LogoutScreen}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_FISCAL_CODE}
      component={FiscalCodeScreen}
    />
    <Stack.Screen
      options={{ gestureEnabled: false }}
      name={ROUTES.INSERT_EMAIL_SCREEN}
      component={EmailInsertScreen}
    />
    <Stack.Screen
      options={{ gestureEnabled: false, headerShown: false }}
      name={ROUTES.EMAIL_VERIFICATION_SCREEN}
      component={EmailValidationSendEmailScreen}
    />
    <Stack.Screen name={ROUTES.PIN_SCREEN} component={PinScreen} />
    <Stack.Screen
      name={ROUTES.PROFILE_DOWNLOAD_DATA}
      component={DownloadProfileDataScreen}
    />
    <Stack.Screen
      name={ROUTES.IO_MARKDOWN_PLAYGROUND}
      component={IOMarkdownPlayground}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={ROUTES.DESIGN_SYSTEM}
      component={DesignSystemNavigator}
    />
    <Stack.Screen
      name={ROUTES.LOLLIPOP_PLAYGROUND}
      component={LollipopPlayground}
    />
    <Stack.Screen
      name={ROUTES.CGN_LANDING_PLAYGROUND}
      component={CgnLandingPlayground}
    />
    <Stack.Screen
      name={ROUTES.TRIALS_SYSTEM_PLAYGROUND}
      component={TrialSystemPlayground}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={ROUTES.IDPAY_ONBOARDING_PLAYGROUND}
      component={IdPayOnboardingPlayground}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={ROUTES.IDPAY_CODE_PLAYGROUND}
      component={IdPayCodePlayGround}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_REMOVE_ACCOUNT_INFO}
      component={RemoveAccountInfo}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS}
      component={RemoveAccountDetails}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={ROUTES.PROFILE_REMOVE_ACCOUNT_SUCCESS}
      component={RemoveAccountSuccess}
    />
    <Stack.Screen
      name={ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS}
      component={NotificationsPreferencesScreen}
    />
  </Stack.Navigator>
);

export default ProfileStackNavigator;

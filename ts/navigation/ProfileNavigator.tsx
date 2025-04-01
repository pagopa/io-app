import { createStackNavigator } from "@react-navigation/stack";
import LogoutScreen from "../components/screens/LogoutScreen";
import { DesignSystemNavigator } from "../features/design-system/navigation/navigator";
import LollipopPlayground from "../features/lollipop/playgrounds/LollipopPlayground";
import CalendarsPreferencesScreen from "../features/settings/views/CalendarsPreferencesScreen";
import CgnLandingPlayground from "../features/settings/views/CgnLandingPlayground";
import DownloadProfileDataScreen from "../features/settings/views/DownloadProfileDataScreen";
import EmailForwardingScreen from "../features/settings/views/EmailForwardingScreen";
import EmailInsertScreen from "../features/settings/views/EmailInsertScreen";
import EmailValidationSendEmailScreen from "../features/settings/views/EmailValidationSendEmailScreen";
import FiscalCodeScreen from "../features/settings/views/FiscalCodeScreen";
import LanguagesPreferencesScreen from "../features/settings/views/LanguagesPreferencesScreen";
import { NotificationsPreferencesScreen } from "../features/settings/views/NotificationsPreferencesScreen";
import PinScreen from "../features/settings/views/PinScreen";
import PreferencesScreen from "../features/settings/views/PreferencesScreen";
import PrivacyMainScreen from "../features/settings/views/PrivacyMainScreen";
import ProfileAboutApp from "../features/settings/views/ProfileAboutApp";
import ProfileDataScreen from "../features/settings/views/ProfileDataScreen";
import RemoveAccountDetails from "../features/settings/views/RemoveAccountDetailsScreen";
import RemoveAccountInfo from "../features/settings/views/RemoveAccountInfoScreen";
import RemoveAccountSuccess from "../features/settings/views/RemoveAccountSuccessScreen";
import SecurityScreen from "../features/settings/views/SecurityScreen";
import ServicesPreferenceScreen from "../features/settings/views/ServicesPreferenceScreen";
import ShareDataScreen from "../features/settings/views/ShareDataScreen";
import TosScreen from "../features/settings/views/TosScreen";
import { IdPayCodePlayGround } from "../features/settings/views/playgrounds/IdPayCodePlayground";
import IdPayOnboardingPlayground from "../features/settings/views/playgrounds/IdPayOnboardingPlayground";
import { isGestureEnabled } from "../utils/navigation";
import TrialSystemPlayground from "../features/settings/views/TrialSystemPlayground";
import ProfileMainScreen from "../features/settings/views/ProfileMainScreen";
import { IOMarkdownPlayground } from "../features/settings/views/playgrounds/IOMarkdownPlayground";
import { AppFeedbackPlayground } from "../features/settings/views/playgrounds/AppFeedbackPlayground";
import AppearancePreferenceScreen from "../features/settings/views/AppearancePreferenceScreen";
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
      name={ROUTES.PROFILE_PREFERENCES_APPEARANCE}
      component={AppearancePreferenceScreen}
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
      name={ROUTES.APP_FEEDBACK_PLAYGROUND}
      component={AppFeedbackPlayground}
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

import { createStackNavigator } from "@react-navigation/stack";
import LogoutScreen from "../screens/LogoutScreen";
import { DesignSystemNavigator } from "../../../design-system/navigation/navigator";
import LollipopPlayground from "../../../lollipop/playgrounds/LollipopPlayground";
import CalendarsPreferencesScreen from "../../preferences/screens/CalendarsPreferencesScreen";
import CgnLandingPlayground from "../../devMode/playgrounds/CgnLandingPlayground";
import DownloadProfileDataScreen from "../../privacy/screens/DownloadProfileDataScreen";
import EmailForwardingScreen from "../../preferences/screens/EmailForwardingScreen";
import EmailInsertScreen from "../../userData/shared/screens/EmailInsertScreen";
import EmailValidationSendEmailScreen from "../../userData/shared/screens/EmailValidationSendEmailScreen";
import FiscalCodeScreen from "../../userData/screens/FiscalCodeScreen";
import LanguagesPreferencesScreen from "../../preferences/screens/LanguagesPreferencesScreen";
import { NotificationsPreferencesScreen } from "../../preferences/screens/NotificationsPreferencesScreen";
import PinScreen from "../../security/screens/PinScreen";
import PreferencesScreen from "../../preferences/screens/PreferencesScreen";
import PrivacyMainScreen from "../../privacy/screens/PrivacyMainScreen";
import ProfileAboutApp from "../../aboutApp/screens/ProfileAboutApp";
import ProfileDataScreen from "../../userData/screens/ProfileDataScreen";
import RemoveAccountDetails from "../../privacy/screens/RemoveAccountDetailsScreen";
import RemoveAccountInfo from "../../privacy/screens/RemoveAccountInfoScreen";
import RemoveAccountSuccess from "../../privacy/screens/RemoveAccountSuccessScreen";
import SecurityScreen from "../../security/screens/SecurityScreen";
import ServicesPreferenceScreen from "../../preferences/screens/ServicesPreferenceScreen";
import ShareDataScreen from "../../privacy/screens/ShareDataScreen";
import TosScreen from "../../privacy/screens/TosScreen";
import { IdPayCodePlayGround } from "../../devMode/playgrounds/IdPayCodePlayground";
import IdPayOnboardingPlayground from "../../devMode/playgrounds/IdPayOnboardingPlayground";
import { isGestureEnabled } from "../../../../utils/navigation";
import TrialSystemPlayground from "../../devMode/playgrounds/TrialSystemPlayground";
import ProfileMainScreen from "../screens/ProfileMainScreen";
import { IOMarkdownPlayground } from "../../devMode/playgrounds/IOMarkdownPlayground";
import { AppFeedbackPlayground } from "../../devMode/playgrounds/AppFeedbackPlayground";
import AppearancePreferenceScreen from "../../preferences/screens/AppearancePreferenceScreen";
import { CiePlayground } from "../../devMode/playgrounds/Cie/CiePlayground";
import { CieIasAndMrtdPlayground } from "../../devMode/playgrounds/Cie/CieIasAndMrtdPlayground";
import { CieIasAndMrtdPlaygroundIntAuthResult } from "../../devMode/playgrounds/Cie/CieIasAndMrtdPlaygroundIntAuthResult";
import { CieIasAndMrtdPlaygroundIntAuth } from "../../devMode/playgrounds/Cie/CieIasAndMrtdPlaygroundIntAuth";
import AuthenticationNavigator from "../../../authentication/common/navigation/AuthenticationNavigator";
import { SettingsParamsList } from "./params/SettingsParamsList";
import { SETTINGS_ROUTES } from "./routes";

const Stack = createStackNavigator<SettingsParamsList>();

/**
 * A navigator for all the screens of the Settings section
 */
const SettingsStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={SETTINGS_ROUTES.SETTINGS_MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      options={{ headerShown: true }}
      name={SETTINGS_ROUTES.SETTINGS_MAIN}
      component={ProfileMainScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_DATA}
      component={ProfileDataScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PRIVACY_MAIN}
      component={PrivacyMainScreen}
    />
    <Stack.Screen
      options={{ headerShown: true }}
      name={SETTINGS_ROUTES.PROFILE_PRIVACY}
      component={TosScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PRIVACY_SHARE_DATA}
      component={ShareDataScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_SECURITY}
      component={SecurityScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_SERVICES}
      component={ServicesPreferenceScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_APPEARANCE}
      component={AppearancePreferenceScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING}
      component={EmailForwardingScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_HOME}
      component={PreferencesScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_CALENDAR}
      component={CalendarsPreferencesScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_LANGUAGE}
      component={LanguagesPreferencesScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_ABOUT_APP}
      component={ProfileAboutApp}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={SETTINGS_ROUTES.PROFILE_LOGOUT}
      component={LogoutScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_FISCAL_CODE}
      component={FiscalCodeScreen}
    />
    <Stack.Screen
      options={{ gestureEnabled: false }}
      name={SETTINGS_ROUTES.INSERT_EMAIL_SCREEN}
      component={EmailInsertScreen}
    />
    <Stack.Screen
      options={{ gestureEnabled: false, headerShown: false }}
      name={SETTINGS_ROUTES.EMAIL_VERIFICATION_SCREEN}
      component={EmailValidationSendEmailScreen}
    />
    <Stack.Screen name={SETTINGS_ROUTES.PIN_SCREEN} component={PinScreen} />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_DOWNLOAD_DATA}
      component={DownloadProfileDataScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.IO_MARKDOWN_PLAYGROUND}
      component={IOMarkdownPlayground}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.APP_FEEDBACK_PLAYGROUND}
      component={AppFeedbackPlayground}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={SETTINGS_ROUTES.DESIGN_SYSTEM}
      component={DesignSystemNavigator}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.LOLLIPOP_PLAYGROUND}
      component={LollipopPlayground}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CGN_LANDING_PLAYGROUND}
      component={CgnLandingPlayground}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.TRIALS_SYSTEM_PLAYGROUND}
      component={TrialSystemPlayground}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={SETTINGS_ROUTES.IDPAY_ONBOARDING_PLAYGROUND}
      component={IdPayOnboardingPlayground}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={SETTINGS_ROUTES.IDPAY_CODE_PLAYGROUND}
      component={IdPayCodePlayGround}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_INFO}
      component={RemoveAccountInfo}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS}
      component={RemoveAccountDetails}
    />
    <Stack.Screen
      options={{
        headerShown: false
      }}
      name={SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_SUCCESS}
      component={RemoveAccountSuccess}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS}
      component={NotificationsPreferencesScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CIE_PLAYGROUND}
      component={CiePlayground}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CIE_IAS_AND_MRTD_PLAYGROUND}
      component={CieIasAndMrtdPlayground}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CIE_IAS_AND_MRTD_PLAYGROUND_INTERNAL_AUTH}
      component={CieIasAndMrtdPlaygroundIntAuth}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CIE_IAS_AND_MRTD_PLAYGROUND_INTERNAL_AUTH_RESULTS}
      component={CieIasAndMrtdPlaygroundIntAuthResult}
    />

    <Stack.Screen
      name={SETTINGS_ROUTES.AUTHENTICATION}
      component={AuthenticationNavigator}
      options={{
        headerShown: false,
        gestureEnabled: false
      }}
    />
  </Stack.Navigator>
);

export default SettingsStackNavigator;

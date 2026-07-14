import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation";
import AuthenticationNavigator from "../../../authentication/common/navigation/AuthenticationNavigator";
import { DesignSystemNavigator } from "../../../design-system/navigation/navigator";
import LollipopPlayground from "../../../lollipop/playgrounds/LollipopPlayground";
import ProfileAboutApp from "../../aboutApp/screens/ProfileAboutApp";
import { AppFeedbackPlayground } from "../../devMode/playgrounds/AppFeedbackPlayground";
import { BottomSheetPlayground } from "../../devMode/playgrounds/BottomSheetPlayground";
import CgnLandingPlayground from "../../devMode/playgrounds/CgnLandingPlayground";
import { CiePlaygroundsNavigator } from "../../devMode/playgrounds/Cie/navigation/CiePlaygroundsNavigator";
import { GuidedTourPlayground } from "../../devMode/playgrounds/GuidedTourPlayground";
import { IdPayCodePlayGround } from "../../devMode/playgrounds/IdPayCodePlayground";
import IdPayOnboardingPlayground from "../../devMode/playgrounds/IdPayOnboardingPlayground";
import { IOMarkdownPlayground } from "../../devMode/playgrounds/IOMarkdownPlayground";
import { NfcPlayground } from "../../devMode/playgrounds/NfcPlayground";
import { SendPlaygroundScreen } from "../../devMode/playgrounds/SendPlaygroundScreen";
import AppearancePreferenceScreen from "../../preferences/screens/AppearancePreferenceScreen";
import CalendarsPreferencesScreen from "../../preferences/screens/CalendarsPreferencesScreen";
import EmailForwardingScreen from "../../preferences/screens/EmailForwardingScreen";
import LanguagesPreferencesScreen from "../../preferences/screens/LanguagesPreferencesScreen";
import { NotificationsPreferencesScreen } from "../../preferences/screens/NotificationsPreferencesScreen";
import PreferencesScreen from "../../preferences/screens/PreferencesScreen";
import ServicesPreferenceScreen from "../../preferences/screens/ServicesPreferenceScreen";
import DownloadProfileDataScreen from "../../privacy/screens/DownloadProfileDataScreen";
import PrivacyMainScreen from "../../privacy/screens/PrivacyMainScreen";
import RemoveAccountDetails from "../../privacy/screens/RemoveAccountDetailsScreen";
import RemoveAccountInfo from "../../privacy/screens/RemoveAccountInfoScreen";
import RemoveAccountSuccess from "../../privacy/screens/RemoveAccountSuccessScreen";
import ShareDataScreen from "../../privacy/screens/ShareDataScreen";
import TosScreen from "../../privacy/screens/TosScreen";
import PinScreen from "../../security/screens/PinScreen";
import SecurityScreen from "../../security/screens/SecurityScreen";
import FiscalCodeScreen from "../../userData/screens/FiscalCodeScreen";
import ProfileDataScreen from "../../userData/screens/ProfileDataScreen";
import EmailInsertScreen from "../../userData/shared/screens/EmailInsertScreen";
import EmailValidationSendEmailScreen from "../../userData/shared/screens/EmailValidationSendEmailScreen";
import LogoutScreen from "../screens/LogoutScreen";
import ProfileMainScreen from "../screens/ProfileMainScreen";
import { SettingsParamsList } from "./params/SettingsParamsList";
import { SETTINGS_ROUTES } from "./routes";

const Stack = createStackNavigator<SettingsParamsList>();

/** A navigator for all the screens of the Settings section */
const SettingsStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={SETTINGS_ROUTES.SETTINGS_MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      component={ProfileMainScreen}
      name={SETTINGS_ROUTES.SETTINGS_MAIN}
      options={{ headerShown: true }}
    />
    <Stack.Screen
      component={ProfileDataScreen}
      name={SETTINGS_ROUTES.PROFILE_DATA}
    />
    <Stack.Screen
      component={PrivacyMainScreen}
      name={SETTINGS_ROUTES.PROFILE_PRIVACY_MAIN}
    />
    <Stack.Screen
      component={TosScreen}
      name={SETTINGS_ROUTES.PROFILE_PRIVACY}
      options={{ headerShown: true }}
    />
    <Stack.Screen
      component={ShareDataScreen}
      name={SETTINGS_ROUTES.PROFILE_PRIVACY_SHARE_DATA}
    />
    <Stack.Screen
      component={SecurityScreen}
      name={SETTINGS_ROUTES.PROFILE_SECURITY}
    />
    <Stack.Screen
      component={ServicesPreferenceScreen}
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_SERVICES}
    />
    <Stack.Screen
      component={AppearancePreferenceScreen}
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_APPEARANCE}
    />
    <Stack.Screen
      component={EmailForwardingScreen}
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING}
    />
    <Stack.Screen
      component={PreferencesScreen}
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_HOME}
    />
    <Stack.Screen
      component={CalendarsPreferencesScreen}
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_CALENDAR}
    />
    <Stack.Screen
      component={LanguagesPreferencesScreen}
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_LANGUAGE}
    />
    <Stack.Screen
      component={ProfileAboutApp}
      name={SETTINGS_ROUTES.PROFILE_ABOUT_APP}
    />
    <Stack.Screen
      component={LogoutScreen}
      name={SETTINGS_ROUTES.PROFILE_LOGOUT}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      component={FiscalCodeScreen}
      name={SETTINGS_ROUTES.PROFILE_FISCAL_CODE}
    />
    <Stack.Screen
      component={EmailInsertScreen}
      name={SETTINGS_ROUTES.INSERT_EMAIL_SCREEN}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      component={EmailValidationSendEmailScreen}
      name={SETTINGS_ROUTES.EMAIL_VERIFICATION_SCREEN}
      options={{ gestureEnabled: false, headerShown: false }}
    />
    <Stack.Screen component={PinScreen} name={SETTINGS_ROUTES.PIN_SCREEN} />
    <Stack.Screen
      component={DownloadProfileDataScreen}
      name={SETTINGS_ROUTES.PROFILE_DOWNLOAD_DATA}
    />
    <Stack.Screen
      component={IOMarkdownPlayground}
      name={SETTINGS_ROUTES.IO_MARKDOWN_PLAYGROUND}
    />
    <Stack.Screen
      component={AppFeedbackPlayground}
      name={SETTINGS_ROUTES.APP_FEEDBACK_PLAYGROUND}
    />
    <Stack.Screen
      component={DesignSystemNavigator}
      name={SETTINGS_ROUTES.DESIGN_SYSTEM}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      component={LollipopPlayground}
      name={SETTINGS_ROUTES.LOLLIPOP_PLAYGROUND}
    />
    <Stack.Screen
      component={CgnLandingPlayground}
      name={SETTINGS_ROUTES.CGN_LANDING_PLAYGROUND}
    />
    <Stack.Screen
      component={IdPayOnboardingPlayground}
      name={SETTINGS_ROUTES.IDPAY_ONBOARDING_PLAYGROUND}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      component={IdPayCodePlayGround}
      name={SETTINGS_ROUTES.IDPAY_CODE_PLAYGROUND}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      component={RemoveAccountInfo}
      name={SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_INFO}
    />
    <Stack.Screen
      component={RemoveAccountDetails}
      name={SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS}
    />
    <Stack.Screen
      component={RemoveAccountSuccess}
      name={SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_SUCCESS}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      component={NotificationsPreferencesScreen}
      name={SETTINGS_ROUTES.PROFILE_PREFERENCES_NOTIFICATIONS}
    />
    <Stack.Screen
      component={CiePlaygroundsNavigator}
      name={SETTINGS_ROUTES.CIE_PLAYGROUND}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={NfcPlayground}
      name={SETTINGS_ROUTES.NFC_PLAYGROUND}
    />
    <Stack.Screen
      component={GuidedTourPlayground}
      name={SETTINGS_ROUTES.GUIDED_TOUR_PLAYGROUND}
    />
    <Stack.Screen
      component={SendPlaygroundScreen}
      name={SETTINGS_ROUTES.SEND_PLAYGROUND}
    />
    <Stack.Screen
      component={BottomSheetPlayground}
      name={SETTINGS_ROUTES.BOTTOM_SHEET_PLAYGROUND}
    />

    <Stack.Screen
      component={AuthenticationNavigator}
      name={SETTINGS_ROUTES.AUTHENTICATION}
      options={{
        headerShown: false,
        gestureEnabled: false
      }}
    />
  </Stack.Navigator>
);

export default SettingsStackNavigator;

import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { OnboardingServicesPreferenceScreenNavigationParams } from "../../features/onboarding/screens/OnboardingServicesPreferenceScreen";
import { SERVICES_ROUTES } from "../../features/services/common/navigation/routes";
import { ServiceDetailsScreenRouteParams } from "../../features/services/details/screens/ServiceDetailsScreen";
import { CieCardReaderScreenNavigationParams } from "../../features/authentication/login/cie/screens/CieCardReaderScreen";
import { AUTHENTICATION_ROUTES } from "../../features/authentication/common/navigation/routes";
import { SETTINGS_ROUTES } from "../../features/settings/common/navigation/routes";

/**
 * @deprecated
 */
export const resetToAuthenticationRoute = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.reset({
      index: 0,
      routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
    })
  );

/**
 * @deprecated
 */
export const navigateToMainNavigatorAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.reset({
      index: 0,
      routes: [{ name: ROUTES.MAIN }]
    })
  );

/**
 * @deprecated
 */
export const navigateBack = () =>
  NavigationService.dispatchNavigationAction(CommonActions.goBack());

/**
 * Authentication
 */

/**
 * @deprecated
 */
export const navigateToIdpSelectionScreenAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_SELECTION
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingPinScreenAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_PIN
    })
  );

/**
 * @deprecated
 */
export const navigateToTosScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_TOS
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingServicePreferenceCompleteAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE
    })
  );

/**
 * @deprecated
 */
export const navigateToServicesPreferenceModeSelectionScreen = (
  params: OnboardingServicesPreferenceScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_SERVICES_PREFERENCE,
      params
    })
  );

/**
 * Service
 */

/**
 * @deprecated
 */
export const navigateToServiceDetailsScreen = (
  params: ServiceDetailsScreenRouteParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
      screen: SERVICES_ROUTES.SERVICE_DETAIL,
      params
    })
  );

/**
 * Profile
 */

/**
 * @deprecated
 */
export const navigateToEmailForwardingPreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING
    })
  );

/**
 * @deprecated
 */
export const navigateToCalendarPreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_CALENDAR
    })
  );

/**
 * @deprecated
 */
export const navigateToLanguagePreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_LANGUAGE
    })
  );

/**
 * @deprecated
 */
export const navigateToLogout = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_LOGOUT
    })
  );

/**
 * @deprecated
 */
export const navigateToRemoveAccountSuccess = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_SUCCESS
    })
  );

/**
 * @deprecated
 */
export const navigateToRemoveAccountDetailScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS
    })
  );

/**
 * @deprecated
 */
export const navigateToPrivacyScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PRIVACY_MAIN,
      params: {
        screen: SETTINGS_ROUTES.PROFILE_PRIVACY_MAIN
      }
    })
  );

/**
 * @deprecated
 */
export const navigateToPrivacyShareData = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PRIVACY_SHARE_DATA
    })
  );

/**
 * CIE
 */

/**
 * @deprecated
 */
export const navigateToCieInvalidScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN
    })
  );

/**
 * @deprecated
 */
export const navigateToCiePinScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
    })
  );

/**
 * @deprecated
 */
export const navigateToCieCardReaderScreen = (
  params?: CieCardReaderScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWorkunitGenericFailureScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WORKUNIT_GENERIC_FAILURE)
  );

/**
 * SPID
 */
/**
 * @deprecated
 */
export const navigateToSPIDTestIDP = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_TEST
    })
  );

/**
 * @deprecated
 */
export const navigateToSPIDLogin = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_LOGIN
    })
  );

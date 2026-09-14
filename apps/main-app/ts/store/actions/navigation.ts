import { CommonActions } from "@react-navigation/native";

import { OnboardingServicesPreferenceScreenNavigationParams } from "../../features/onboarding/screens/OnboardingServicesPreferenceScreen";
import { SETTINGS_ROUTES } from "../../features/settings/common/navigation/routes";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";

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
 * Authentication
 */

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
 * Profile
 */

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
 * CIE
 */

/**
 * @deprecated
 */
export const navigateToWorkunitGenericFailureScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WORKUNIT_GENERIC_FAILURE)
  );

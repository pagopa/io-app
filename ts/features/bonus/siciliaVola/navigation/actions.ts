import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import SV_ROUTES from "./routes";

/**
 * @deprecated
 */
export const navigateToSvCheckStatusRouterScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS
    })
  );

/**
 * @deprecated
 */
export const navigateToSvSelectBeneficiaryCategoryScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.SELECT_BENEFICIARY_CATEGORY
    })
  );

/**
 * @deprecated
 */
export const navigateToSvStudentSelectDestinationScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.STUDENT_SELECT_DESTINATION
    })
  );

/**
 * @deprecated
 */
export const navigateToSvDisabledAdditionalInfoScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.DISABLED_ADDITIONAL_INFO
    })
  );

/**
 * @deprecated
 */
export const navigateToSvWorkerCheckIncomeThresholdScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.WORKER_CHECK_INCOME_THRESHOLD
    })
  );

/**
 * @deprecated
 */
export const navigateToSvWorkerSelectDestinationScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.WORKER_SELECT_DESTINATION
    })
  );

/**
 * @deprecated
 */
export const navigateToSvSickCheckIncomeThresholdScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.SICK_CHECK_INCOME_THRESHOLD
    })
  );

/**
 * @deprecated
 */
export const navigateToSvSickSelectDestinationScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.SICK_SELECT_DESTINATION
    })
  );

/**
 * @deprecated
 */
export const navigateToSvSelectFlightsDateScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.SELECT_FLIGHTS_DATA
    })
  );

/**
 * @deprecated
 */
export const navigateToSvSummaryScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.SUMMARY
    })
  );

/**
 * @deprecated
 */
export const navigateToSvVoucherGeneratedScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.VOUCHER_GENERATED
    })
  );

/**
 * @deprecated
 */
export const navigateToSvKoCheckResidenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_RESIDENCE
    })
  );

/**
 * @deprecated
 */
export const navigateToSvKoSelectBeneficiaryCategoryScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.KO_SELECT_BENEFICIARY_CATEGORY
    })
  );

/**
 * @deprecated
 */
export const navigateToSvKoCheckIncomeThresholdScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_INCOME_THRESHOLD
    })
  );

/**
 * @deprecated
 */
export const navigateToSvTimeoutGeneratedVoucherScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_GENERATION.TIMEOUT_GENERATED_VOUCHER
    })
  );

/**
 * @deprecated
 */
export const navigateToSvVoucherListScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_LIST.LIST
    })
  );

/**
 * @deprecated
 */
export const navigateToSvVoucherDetailsScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: SV_ROUTES.VOUCHER_LIST.DETAILS
    })
  );

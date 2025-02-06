import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  NavigatorScreenParams,
  ParamListBase,
  RouteProp,
  useNavigation
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  CgnActivationParamsList,
  CgnDetailsParamsList,
  CgnEYCAActivationParamsList
} from "../../features/bonus/cgn/navigation/params";
import CGN_ROUTES from "../../features/bonus/cgn/navigation/routes";
import { FciParamsList } from "../../features/fci/navigation/params";
import { FCI_ROUTES } from "../../features/fci/navigation/routes";
import {
  FIMS_ROUTES,
  FimsParamsList
} from "../../features/fims/common/navigation";
import { IdPayBarcodeParamsList } from "../../features/idpay/barcode/navigation/params";
import { IdPayBarcodeRoutes } from "../../features/idpay/barcode/navigation/routes";
import { IdPayCodeParamsList } from "../../features/idpay/code/navigation/params";
import { IdPayCodeRoutes } from "../../features/idpay/code/navigation/routes";

import { IdPayConfigurationParamsList } from "../../features/idpay/configuration/navigation/params";
import { IdPayConfigurationRoutes } from "../../features/idpay/configuration/navigation/routes";
import {
  IDPayDetailsParamsList,
  IDPayDetailsRoutes
} from "../../features/idpay/details/navigation";
import { IdPayOnboardingParamsList } from "../../features/idpay/onboarding/navigation/params";
import { IdPayOnboardingRoutes } from "../../features/idpay/onboarding/navigation/routes";
import { IdPayPaymentParamsList } from "../../features/idpay/payment/navigation/params";
import { IdPayPaymentRoutes } from "../../features/idpay/payment/navigation/routes";
import { IdPayUnsubscriptionParamsList } from "../../features/idpay/unsubscription/navigation/params";
import { IdPayUnsubscriptionRoutes } from "../../features/idpay/unsubscription/navigation/routes";
import { ItwParamsList } from "../../features/itwallet/navigation/ItwParamsList";
import { ITW_ROUTES } from "../../features/itwallet/navigation/routes";
import { MessagesParamsList } from "../../features/messages/navigation/params";
import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";
import { PaymentsBarcodeParamsList } from "../../features/payments/barcode/navigation/params";
import { PaymentsBarcodeRoutes } from "../../features/payments/barcode/navigation/routes";
import { PaymentsCheckoutParamsList } from "../../features/payments/checkout/navigation/params";
import { PaymentsCheckoutRoutes } from "../../features/payments/checkout/navigation/routes";
import { PaymentsMethodDetailsParamsList } from "../../features/payments/details/navigation/params";
import { PaymentsMethodDetailsRoutes } from "../../features/payments/details/navigation/routes";
import { PaymentsOnboardingParamsList } from "../../features/payments/onboarding/navigation/params";
import { PaymentsOnboardingRoutes } from "../../features/payments/onboarding/navigation/routes";
import { PaymentsReceiptParamsList } from "../../features/payments/receipts/navigation/params";
import { PaymentsReceiptRoutes } from "../../features/payments/receipts/navigation/routes";
import { NOTIFICATIONS_ROUTES } from "../../features/pushNotifications/navigation/routes";
import { ServicesParamsList } from "../../features/services/common/navigation/params";
import { SERVICES_ROUTES } from "../../features/services/common/navigation/routes";
import { ZendeskParamsList } from "../../features/zendesk/navigation/params";
import ZENDESK_ROUTES from "../../features/zendesk/navigation/routes";
import { ItwRemoteParamsList } from "../../features/itwallet/presentation/remote/navigation/ItwRemoteParamsList.ts";
import { ITW_REMOTE_ROUTES } from "../../features/itwallet/presentation/remote/navigation/routes.ts";
import ROUTES from "../routes";
import { AuthenticationParamsList } from "./AuthenticationParamsList";
import { CheckEmailParamsList } from "./CheckEmailParamsList";
import { MainTabParamsList } from "./MainTabParamsList";
import { OnboardingParamsList } from "./OnboardingParamsList";
import { ProfileParamsList } from "./ProfileParamsList";

export type AppParamsList = {
  [ROUTES.INGRESS]: undefined;
  [ROUTES.UNSUPPORTED_DEVICE]: undefined;
  [ROUTES.BACKGROUND]: undefined;
  [ROUTES.AUTHENTICATION]: NavigatorScreenParams<AuthenticationParamsList>;
  [ROUTES.CHECK_EMAIL]: NavigatorScreenParams<CheckEmailParamsList>;
  [ROUTES.ONBOARDING]: NavigatorScreenParams<OnboardingParamsList>;
  [ROUTES.MAIN]: NavigatorScreenParams<MainTabParamsList>;

  [MESSAGES_ROUTES.MESSAGES_NAVIGATOR]: NavigatorScreenParams<MessagesParamsList>;
  [MESSAGES_ROUTES.MESSAGES_SEARCH]: undefined;
  [NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS]: undefined;
  [SERVICES_ROUTES.SERVICES_NAVIGATOR]: NavigatorScreenParams<ServicesParamsList>;
  [SERVICES_ROUTES.SEARCH]: undefined;
  [ROUTES.PROFILE_NAVIGATOR]: NavigatorScreenParams<ProfileParamsList>;

  [ROUTES.BARCODE_SCAN]: undefined;

  [CGN_ROUTES.ACTIVATION.MAIN]: NavigatorScreenParams<CgnActivationParamsList>;
  [CGN_ROUTES.DETAILS.MAIN]: NavigatorScreenParams<CgnDetailsParamsList>;
  [CGN_ROUTES.EYCA.ACTIVATION
    .MAIN]: NavigatorScreenParams<CgnEYCAActivationParamsList>;

  [ROUTES.WORKUNIT_GENERIC_FAILURE]: undefined;
  [ZENDESK_ROUTES.MAIN]: NavigatorScreenParams<ZendeskParamsList>;
  [FIMS_ROUTES.MAIN]: NavigatorScreenParams<FimsParamsList>;
  [FCI_ROUTES.MAIN]: NavigatorScreenParams<FciParamsList>;

  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN]: NavigatorScreenParams<IdPayOnboardingParamsList>;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR]: NavigatorScreenParams<IdPayConfigurationParamsList>;
  [IDPayDetailsRoutes.IDPAY_DETAILS_MAIN]: NavigatorScreenParams<IDPayDetailsParamsList>;
  [IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN]: NavigatorScreenParams<IdPayUnsubscriptionParamsList>;
  [IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN]: undefined; // FIXME IOBP-383: remove after react-navigation 6.x upgrade. This should be insde IDPAY_PAYMENT_MAIN
  [IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN]: NavigatorScreenParams<IdPayPaymentParamsList>;
  [IdPayCodeRoutes.IDPAY_CODE_MAIN]: NavigatorScreenParams<IdPayCodeParamsList>;

  [IdPayBarcodeRoutes.IDPAY_BARCODE_MAIN]: NavigatorScreenParams<IdPayBarcodeParamsList>;

  [PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR]: NavigatorScreenParams<PaymentsOnboardingParamsList>;
  [PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR]: NavigatorScreenParams<PaymentsCheckoutParamsList>;
  [PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR]: NavigatorScreenParams<PaymentsBarcodeParamsList>;
  [PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR]: NavigatorScreenParams<PaymentsMethodDetailsParamsList>;
  [PaymentsReceiptRoutes.PAYMENT_RECEIPT_NAVIGATOR]: NavigatorScreenParams<PaymentsReceiptParamsList>;

  [ITW_ROUTES.MAIN]: NavigatorScreenParams<ItwParamsList>;
  [ITW_REMOTE_ROUTES.MAIN]: NavigatorScreenParams<ItwRemoteParamsList>;
};

/**
 * Merge the navigation of the ParamList stack with AppParamsList, in order to allow
 * the navigation in the same stack and the global stack.
 * This should be used in the new react-navigation v5 navigator
 */
export type IOStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IOStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IOStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<AppParamsList & ParamList, RouteName>;
export type IOTabNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = BottomTabNavigationProp<MainTabParamsList & ParamList, RouteName>;

export const useIONavigation = () =>
  useNavigation<IOStackNavigationProp<AppParamsList, keyof AppParamsList>>();
export const useIOTabNavigation = () =>
  useNavigation<
    IOTabNavigationProp<MainTabParamsList, keyof MainTabParamsList>
  >();

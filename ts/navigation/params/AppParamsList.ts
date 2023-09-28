import {
  NavigatorScreenParams,
  ParamListBase,
  RouteProp
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { CdcBonusRequestParamsList } from "../../features/bonus/cdc/navigation/params";
import { CDC_ROUTES } from "../../features/bonus/cdc/navigation/routes";
import {
  CgnActivationParamsList,
  CgnDetailsParamsList,
  CgnEYCAActivationParamsList
} from "../../features/bonus/cgn/navigation/params";
import CGN_ROUTES from "../../features/bonus/cgn/navigation/routes";
import { FciParamsList } from "../../features/fci/navigation/params";
import { FCI_ROUTES } from "../../features/fci/navigation/routes";
import { FimsParamsList } from "../../features/fims/navigation/params";
import FIMS_ROUTES from "../../features/fims/navigation/routes";
import {
  IDPayPaymentParamsList,
  IDPayPaymentRoutes
} from "../../features/idpay/payment/navigation/navigator";
import {
  IDPayConfigurationParamsList,
  IDPayConfigurationRoutes
} from "../../features/idpay/configuration/navigation/navigator";
import {
  IDPayDetailsParamsList,
  IDPayDetailsRoutes
} from "../../features/idpay/details/navigation";
import {
  IDPayOnboardingParamsList,
  IDPayOnboardingRoutes
} from "../../features/idpay/onboarding/navigation/navigator";
import {
  IDPayUnsubscriptionNavigatorParams,
  IDPayUnsubscriptionParamsList,
  IDPayUnsubscriptionRoutes
} from "../../features/idpay/unsubscription/navigation/navigator";
import {
  WalletOnboardingParamsList,
  WalletOnboardingRoutes
} from "../../features/walletV3/onboarding/navigation/navigator";
import UADONATION_ROUTES from "../../features/uaDonations/navigation/routes";
import { UAWebviewScreenNavigationParams } from "../../features/uaDonations/screens/UAWebViewScreen";
import { ZendeskParamsList } from "../../features/zendesk/navigation/params";
import ZENDESK_ROUTES from "../../features/zendesk/navigation/routes";
import ROUTES from "../routes";
import { IdPayCodeRoutes } from "../../features/idpay/code/navigation/routes";
import { IdPayCodeParamsList } from "../../features/idpay/code/navigation/params";
import { AuthenticationParamsList } from "./AuthenticationParamsList";
import { MainTabParamsList } from "./MainTabParamsList";
import { MessagesParamsList } from "./MessagesParamsList";
import { OnboardingParamsList } from "./OnboardingParamsList";
import { ProfileParamsList } from "./ProfileParamsList";
import { ServicesParamsList } from "./ServicesParamsList";
import { WalletParamsList } from "./WalletParamsList";

export type AppParamsList = {
  [ROUTES.INGRESS]: undefined;
  [ROUTES.UNSUPPORTED_DEVICE]: undefined;
  [ROUTES.BACKGROUND]: undefined;
  [ROUTES.AUTHENTICATION]: NavigatorScreenParams<AuthenticationParamsList>;
  [ROUTES.ONBOARDING]: NavigatorScreenParams<OnboardingParamsList>;
  [ROUTES.MAIN]: NavigatorScreenParams<MainTabParamsList>;

  [ROUTES.MESSAGES_NAVIGATOR]: NavigatorScreenParams<MessagesParamsList>;
  [ROUTES.WALLET_NAVIGATOR]: NavigatorScreenParams<WalletParamsList>;
  [ROUTES.SERVICES_NAVIGATOR]: NavigatorScreenParams<ServicesParamsList>;
  [ROUTES.PROFILE_NAVIGATOR]: NavigatorScreenParams<ProfileParamsList>;

  [ROUTES.BARCODE_SCAN]: undefined;

  [CGN_ROUTES.ACTIVATION.MAIN]: NavigatorScreenParams<CgnActivationParamsList>;
  [CGN_ROUTES.DETAILS.MAIN]: NavigatorScreenParams<CgnDetailsParamsList>;
  [CGN_ROUTES.EYCA.ACTIVATION
    .MAIN]: NavigatorScreenParams<CgnEYCAActivationParamsList>;

  [ROUTES.WORKUNIT_GENERIC_FAILURE]: undefined;
  [ZENDESK_ROUTES.MAIN]: NavigatorScreenParams<ZendeskParamsList>;
  [UADONATION_ROUTES.WEBVIEW]: NavigatorScreenParams<UAWebviewScreenNavigationParams>;
  [CDC_ROUTES.BONUS_REQUEST_MAIN]: NavigatorScreenParams<CdcBonusRequestParamsList>;
  [FIMS_ROUTES.MAIN]: NavigatorScreenParams<FimsParamsList>;
  [FCI_ROUTES.MAIN]: NavigatorScreenParams<FciParamsList>;

  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN]: NavigatorScreenParams<IDPayOnboardingParamsList>;
  [IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN]: NavigatorScreenParams<IDPayConfigurationParamsList>;
  [IDPayDetailsRoutes.IDPAY_DETAILS_MAIN]: NavigatorScreenParams<IDPayDetailsParamsList>;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN]:
    | NavigatorScreenParams<IDPayUnsubscriptionParamsList>
    | IDPayUnsubscriptionNavigatorParams;
  [IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN]: undefined;
  [IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN]: NavigatorScreenParams<IDPayPaymentParamsList>;
  [IdPayCodeRoutes.IDPAY_CODE_MAIN]: NavigatorScreenParams<IdPayCodeParamsList>;

  [WalletOnboardingRoutes.WALLET_ONBOARDING_MAIN]: NavigatorScreenParams<WalletOnboardingParamsList>;
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

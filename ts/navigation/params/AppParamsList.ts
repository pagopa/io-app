import ROUTES from "../routes";
import UADONATION_ROUTES from "../../features/uaDonations/navigation/routes";

export type AppParamsList = {
  [ROUTES.INGRESS]: undefined;
  [ROUTES.BACKGROUND]: undefined;
  // TODO: [ROUTES.AUTHENTICATION]: NavigatorScreenParams<AuthenticationParamsList>
  // TODO: [ROUTES.ONBOARDING]: NavigatorScreenParams<OnboardingParamsList>
  // TODO: [ROUTES.MAIN]: NavigatorScreenParams<MainParamsList>
  // TODO: [CGN_ROUTES.ACTIVATION.MAIN]: NavigatorScreenParams<CgnActivationParamsList>
  // TODO: [CGN_ROUTES.DETAILS.MAIN]: NavigatorScreenParams<CgnDetailsParamsList>
  // TODO: [CGN_ROUTES.EYCA.ACTIVATION.MAIN]: NavigatorScreenParams<CgnEYCAActivationParamsList>

  [ROUTES.WORKUNIT_GENERIC_FAILURE]: undefined;
  // TODO: [ZENDESK_ROUTES.MAIN]: NavigatorScreenParams<ZendeskParamsList>
  [UADONATION_ROUTES.WEBVIEW]: undefined;
};

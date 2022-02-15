import ROUTES from "../routes";

export type AppParamsList = {
  [ROUTES.INGRESS]: undefined;
  [ROUTES.BACKGROUND]: undefined;
  // TODO: [ROUTES.AUTHENTICATION]: NavigatorScreenParams<AuthenticationParamsList>
  // TODO: [ROUTES.ONBOARDING]: NavigatorScreenParams<OnboardingParamsList>
  // TODO: [ROUTES.MAIN]: NavigatorScreenParams<MainParamsList>

  [ROUTES.WORKUNIT_GENERIC_FAILURE]: undefined;

  // TODO: [ZENDESK_ROUTES.HELP_CENTER]: NavigatorScreenParams<ZendeskParamsList>
};

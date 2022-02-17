import {
  NavigatorScreenParams,
  ParamListBase,
  RouteProp
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  CgnActivationParamsList,
  CgnDetailsParamsList,
  CgnEYCAActivationParamsList
} from "../../features/bonus/cgn/navigation/params";
import CGN_ROUTES from "../../features/bonus/cgn/navigation/routes";
import { ZendeskParamsList } from "../../features/zendesk/navigation/params";
import ZENDESK_ROUTES from "../../features/zendesk/navigation/routes";
import ROUTES from "../routes";
import { AuthenticationParamsList } from "./AuthenticationParamsList";
import { MainParamsList } from "./MainParamsList";
import { OnboardingParamsList } from "./OnboardingParamsList";

export type AppParamsList = {
  [ROUTES.INGRESS]: undefined;
  [ROUTES.BACKGROUND]: undefined;
  [ROUTES.AUTHENTICATION]: NavigatorScreenParams<AuthenticationParamsList>;
  [ROUTES.ONBOARDING]: NavigatorScreenParams<OnboardingParamsList>;
  [ROUTES.MAIN]: NavigatorScreenParams<MainParamsList>;
  [CGN_ROUTES.ACTIVATION.MAIN]: NavigatorScreenParams<CgnActivationParamsList>;
  [CGN_ROUTES.DETAILS.MAIN]: NavigatorScreenParams<CgnDetailsParamsList>;
  [CGN_ROUTES.EYCA.ACTIVATION
    .MAIN]: NavigatorScreenParams<CgnEYCAActivationParamsList>;

  [ROUTES.WORKUNIT_GENERIC_FAILURE]: undefined;

  [ZENDESK_ROUTES.MAIN]: NavigatorScreenParams<ZendeskParamsList>;
};

/**
 * Merge the navigation of the ParamList stack with AppParamsList, in order to allow
 * the navigation in the same stack and the global stack
 */
export type IOStackNavigationProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: StackNavigationProp<AppParamsList & ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

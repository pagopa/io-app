import { NavigationRoute, NavigationRouteConfigMap } from "react-navigation";
import {
  NavigationStackOptions,
  NavigationStackProp
} from "react-navigation-stack";
import { euCovidCertificateEnabled, mvlEnabled } from "../../../config";
import EuCovidCertNavigator from "../../euCovidCert/navigation/navigator";
import EUCOVIDCERT_ROUTES from "../../euCovidCert/navigation/routes";
import MvlNavigator from "../../mvl/navigation/navigator";
import MVL_ROUTES from "../../mvl/navigation/routes";

const euCovidCertificateRouteConfig: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = euCovidCertificateEnabled
  ? {
      [EUCOVIDCERT_ROUTES.MAIN]: {
        screen: EuCovidCertNavigator
      }
    }
  : {};

const mvlRouteConfig: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = mvlEnabled
  ? {
      [MVL_ROUTES.MAIN]: {
        screen: MvlNavigator
      }
    }
  : {};

export const featuresNavigators = {
  ...euCovidCertificateRouteConfig,
  ...mvlRouteConfig
};

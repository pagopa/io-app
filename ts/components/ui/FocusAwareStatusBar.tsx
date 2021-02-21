import React, { FC } from "react";
import { connect } from "react-redux";
import { StatusBar } from "react-native";
import { NavigationState, NavigationRoute } from "react-navigation";
import ROUTES from "../../navigation/routes";
import customVariables from "../../theme/variables";
import { GlobalState } from "../../store/reducers/types";
import { IOColors } from "../core/variables/IOColors";

type StatusBarColorBackgroundConfig = {
  barStyle: "light-content" | "dark-content";
  backgroundColor: string;
};

type Routes = keyof typeof ROUTES;

const getActiveRoute = (route: NavigationState): NavigationRoute => {
  const { routes, index } = route;

  return routes?.length && index < routes.length
    ? (getActiveRoute(routes[index] as NavigationState) as NavigationRoute)
    : (route as NavigationRoute);
};

const mapStateToProps = ({ nav }: GlobalState) => ({
  currentRoute: getActiveRoute(nav).routeName
});

type Props = ReturnType<typeof mapStateToProps>;

const darkGrayConfig: StatusBarColorBackgroundConfig = {
  barStyle: "light-content",
  backgroundColor: customVariables.brandDarkGray
};

const blueConfig: StatusBarColorBackgroundConfig = {
  barStyle: "light-content",
  backgroundColor: customVariables.brandPrimary
};

const defaultConfig: StatusBarColorBackgroundConfig = {
  barStyle: "dark-content",
  backgroundColor: IOColors.white
};

const statusBarConfigMap = new Map<Routes, StatusBarColorBackgroundConfig>([
  ["WALLET_HOME", darkGrayConfig],
  ["PROFILE_MAIN", darkGrayConfig],
  ["WALLET_BPAY_DETAIL", darkGrayConfig],
  ["WALLET_CARD_TRANSACTIONS", darkGrayConfig],
  ["WALLET_BANCOMAT_DETAIL", darkGrayConfig],
  ["WALLET_SATISPAY_DETAIL", darkGrayConfig],
  ["WALLET_BPAY_DETAIL", darkGrayConfig],
  ["WALLET_COBADGE_DETAIL", darkGrayConfig],
  ["INGRESS", blueConfig]
]);

const FocusAwareStatusBar: FC<Props> = ({ currentRoute }) => {
  const currentRouteConfig = statusBarConfigMap.get(currentRoute as Routes);
  const statusBarProps =
    currentRouteConfig !== undefined ? currentRouteConfig : defaultConfig;

  return <StatusBar {...statusBarProps} />;
};

export default connect(mapStateToProps)(FocusAwareStatusBar);

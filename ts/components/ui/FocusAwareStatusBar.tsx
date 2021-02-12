import React, { FC } from "react";
import { connect } from "react-redux";
import { StatusBar } from "react-native";
import ROUTES from "../../navigation/routes";
import customVariables from "../../theme/variables";
import { GlobalState } from "../../store/reducers/types";
import { IOColors } from "../core/variables/IOColors";

type StatusBarColorBackgroundConfig = {
  barStyle: "light-content" | "dark-content";
  backgroundColor: string;
};

type Routes = keyof typeof ROUTES;

const mapStateToProps = ({ nav: { routes } }: GlobalState) => ({
  // Only way to access current route name, within the TabNavigator
  currentRoute: routes[0].routes[routes[0].index].routes[0].routeName
});

type Props = ReturnType<typeof mapStateToProps>;

const darkConfig: StatusBarColorBackgroundConfig = {
  barStyle: "light-content",
  backgroundColor: customVariables.brandDarkGray
};

const defaultConfig: StatusBarColorBackgroundConfig = {
  barStyle: "dark-content",
  backgroundColor: IOColors.white
};

const statusBarConfigMap = new Map<Routes, StatusBarColorBackgroundConfig>([
  ["WALLET_HOME", darkConfig],
  ["PROFILE_MAIN", darkConfig]
]);

const FocusAwareStatusBar: FC<Props> = ({ currentRoute }) => {
  const currentRouteConfig = statusBarConfigMap.get(currentRoute as Routes);

  return (
    <StatusBar
      {...(currentRouteConfig !== undefined
        ? currentRouteConfig
        : defaultConfig)}
    />
  );
};

export default connect(mapStateToProps)(FocusAwareStatusBar);

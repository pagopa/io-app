import {
  NavigationAction,
  NavigationActions,
  NavigationContainerComponent,
  NavigationParams
} from "react-navigation";

// eslint-disable-next-line functional/no-let
let navigator: NavigationContainerComponent | null;

function setTopLevelNavigator(
  navigatorRef: NavigationContainerComponent | null
) {
  navigator = navigatorRef;
}

const navigate = (routeName: string, params?: NavigationParams) => {
  navigator?.dispatch(NavigationActions.navigate({ routeName, params }));
};

const dispatchNavigationAction = (action: NavigationAction) => {
  navigator?.dispatch(action);
};

// add other navigation functions that you need and export them
export default { navigate, setTopLevelNavigator, dispatchNavigationAction };

import React, { ReactElement, useEffect } from "react";
import { Provider } from "react-redux";
import { render, RenderOptions } from "@testing-library/react-native";
import {
  createAppContainer,
  NavigationContainer,
  createStackNavigator
} from "react-navigation";
import { Store } from "redux";
import { NavigationInjectedProps } from "react-navigation";

// Creates a simple wrapper for the render method which encloses the element to render in a store provider
export function renderWithRedux<S>(
  ui: ReactElement,
  store: Store<S>,
  renderOptions: RenderOptions
) {
  function Wrapper({ children }: any) {
    return <Provider store={store}>{children}</Provider>;
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export // If the screen to render and test is reachable via a navigator, create an app and render it
function renderNavContainerRedux<S>(
  navContainer: NavigationContainer,
  store: Store<S>,
  renderOptions: RenderOptions
) {
  const App = createAppContainer(navContainer);
  return renderWithRedux(<App />, store, renderOptions);
}

export function fakeScreenFactory<NP>(route: string, params: NP) {
  // The fake screen fires a navigation to the screen under test when mounted, so as to avoid mocking navigation route parmeters.
  return ({ navigation }: NavigationInjectedProps) => {
    useEffect(() => {
      navigation.navigate(route, params);
    });
    return <></>;
  };
}

export function renderScreenFakeNavRedux<S, NP>(
  screen: React.ComponentType<any>, // I need any to avoid passing navigation
  route: string,
  params: NP,
  store: Store<S>,
  renderOptions: RenderOptions = {}
) {
  const customRouteConfigMap = {
    [route]: screen,
    // fakeScreen is needed to inject params in navigation route
    [0]: fakeScreenFactory(route, params) // not sure if 0 is right
  };

  const customNavigator = createStackNavigator(customRouteConfigMap, {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  });

  return renderNavContainerRedux(customNavigator, store, renderOptions);
}

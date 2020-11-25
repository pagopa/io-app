import React, { useEffect } from "react";
import { Provider } from "react-redux";
// import { Button } from "react-native";
import { render } from "@testing-library/react-native";
import {
  createAppContainer,
  NavigationContainer,
  createStackNavigator
} from "react-navigation";

// Creates a simple wrapper for the render method which encloses the element to render in a store provider
export const renderWithRedux = (
  ui: any,
  { initialState, store, ...renderOptions }: any = {}
) => {
  function Wrapper({ children }: any) {
    return <Provider store={store}>{children}</Provider>;
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export // If the screen to render and test is reachable via a navigator, create an app and render it
const renderNavContainerRedux = (
  navContainer: NavigationContainer,
  { initialState, store, ...renderOptions }: any = {}
) => {
  const App = createAppContainer(navContainer);
  return renderWithRedux(<App />, {
    initialState,
    store,
    ...renderOptions
  });
};

export function fakeScreenFactory(route: any, params: any) {
  // The fake screen fires a navigation to the screen under test when mounted, so as to avoid mocking navigation route parmeters.
  return ({ navigation }: any) => {
    useEffect(() => {
      navigation.navigate(route, params);
    });
    return <></>;
  };
}

export const renderScreenFakeNavRedux = (
  screen: any,
  route: any,
  params: any,
  { initialState, store, ...renderOptions }: any = {}
) => {
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

  return renderNavContainerRedux(customNavigator, {
    initialState,
    store,
    ...renderOptions
  });
};

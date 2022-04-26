import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import { render, RenderOptions } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import { TestInnerNavigationContainer } from "../navigation/AppStackNavigator";

/**
 * This should be used to test component that requires a compat navigation context (inside a compat navigator)
 * @param screen
 * @param route
 * @param params
 * @param store
 * @param renderOptions
 */
export const renderScreenFakeNavRedux = <S,>(
  screen: React.ComponentType<any>, // I need any to avoid passing navigation
  route: string,
  params: Record<string, any>,
  store: Store<S>,
  renderOptions: RenderOptions = {}
) => {
  const customRouteConfigMap = {
    [route]: { screen, params }
  };

  const customNavigator = createCompatNavigatorFactory(createStackNavigator)(
    customRouteConfigMap,
    {
      // Let each screen handle the header and navigation
      headerMode: "none",
      defaultNavigationOptions: {
        gestureEnabled: false
      }
    }
  );

  const Stack = createStackNavigator();
  const component = (
    <Provider store={store}>
      <TestInnerNavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name={route}
            component={customNavigator}
            initialParams={params}
          />
        </Stack.Navigator>
      </TestInnerNavigationContainer>
    </Provider>
  );

  return render(component, renderOptions);
};

/**
 * This should be used to test component in a new navigator
 * @param screen
 * @param route
 * @param params
 * @param store
 * @param renderOptions
 */
export const renderScreenWithNavigationStoreContext = <S,>(
  screen: React.ComponentType<any>, // I need any to avoid passing navigation
  route: string,
  params: Record<string, any>,
  store: Store<S>,
  renderOptions: RenderOptions = {}
) => {
  const Stack = createStackNavigator();
  const component = (
    <Provider store={store}>
      <TestInnerNavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name={route}
            component={screen}
            initialParams={params}
          />
        </Stack.Navigator>
      </TestInnerNavigationContainer>
    </Provider>
  );

  return render(component, renderOptions);
};

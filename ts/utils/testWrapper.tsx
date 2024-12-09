import { createStackNavigator } from "@react-navigation/stack";
import { render, RenderOptions } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { createStore, Store } from "redux";
import { TestInnerNavigationContainer } from "../navigation/AppStackNavigator";
import * as linkingSubscription from "../navigation/linkingSubscription";
import { applicationChangeState } from "../store/actions/application";
import { appReducer } from "../store/reducers";

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
  renderOptions: RenderOptions = {},
  mockLinkingSubscription = jest.fn()
) => {
  jest
    .spyOn(linkingSubscription, "linkingSubscription")
    .mockImplementation(mockLinkingSubscription);
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

export const renderTestingComponent = (component: React.ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  const Wrapper = ({ children }: React.PropsWithChildren<any>) => (
    <Provider store={store}>
      <SafeAreaProvider
        initialMetrics={{
          frame: {
            width: 1080,
            height: 1920,
            x: 0,
            y: 0
          },
          insets: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0
          }
        }}
      >
        {children}
      </SafeAreaProvider>
    </Provider>
  );

  return render(component, {
    wrapper: Wrapper
  });
};

import { IOThemeContextProvider } from "@io-app/design-system";
import { createStackNavigator } from "@react-navigation/stack";
import {
  render,
  renderAsync,
  RenderAsyncOptions,
  RenderOptions
} from "@testing-library/react-native";
import { ComponentType } from "react";
import { Linking } from "react-native";
import { Provider } from "react-redux";
import { Store } from "redux";

import { TestInnerNavigationContainer } from "../navigation/AppStackNavigator";
import * as linkingSubscription from "../navigation/linkingSubscription";

/** Renders a screen with a store and navigator, mocking the linking subscription. */
export const renderScreenWithNavigationStoreContext = <S,>(
  screen: ComponentType<any>,
  route: string,
  params: Record<string, any>,
  store: Store<S>,
  renderOptions: RenderOptions = {},
  mockLinkingSubscription = jest.fn()
) =>
  render(
    createScreenWithNavigationStoreContext(
      screen,
      route,
      params,
      store,
      mockLinkingSubscription
    ),
    renderOptions
  );

/**
 * Awaits the initial render and effects with the same providers and linking mock
 * as the synchronous helper. Use asynchronous interactions with the result.
 */
export const renderScreenWithNavigationStoreContextAsync = <S,>(
  screen: ComponentType<any>,
  route: string,
  params: Record<string, any>,
  store: Store<S>,
  renderOptions: RenderAsyncOptions = {},
  mockLinkingSubscription = jest.fn()
) =>
  renderAsync(
    createScreenWithNavigationStoreContext(
      screen,
      route,
      params,
      store,
      mockLinkingSubscription
    ),
    renderOptions
  );

const createScreenWithNavigationStoreContext = <S,>(
  screen: ComponentType<any>,
  route: string,
  params: Record<string, any>,
  store: Store<S>,
  mockLinkingSubscription: jest.Mock
) => {
  jest
    .spyOn(linkingSubscription, "linkingSubscription")
    .mockImplementation(mockLinkingSubscription);
  jest.spyOn(Linking, "getInitialURL").mockReturnValue(Promise.resolve(null));
  const Stack = createStackNavigator();
  return (
    <Provider store={store}>
      <IOThemeContextProvider theme={"light"}>
        <TestInnerNavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              component={screen}
              initialParams={params}
              name={route}
            />
          </Stack.Navigator>
        </TestInnerNavigationContainer>
      </IOThemeContextProvider>
    </Provider>
  );
};

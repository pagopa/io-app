import { createStackNavigator } from "@react-navigation/stack";
import { render, RenderOptions } from "@testing-library/react-native";

import { ComponentType } from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import { TestInnerNavigationContainer } from "../navigation/AppStackNavigator";
import * as linkingSubscription from "../navigation/linkingSubscription";

/**
 * This should be used to test component in a new navigator
 * @param screen
 * @param route
 * @param params
 * @param store
 * @param renderOptions
 */
export const renderScreenWithNavigationStoreContext = <S,>(
  screen: ComponentType<any>, // I need any to avoid passing navigation
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

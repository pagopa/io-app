import { NavigationContext } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";

/**
 * Renders a component wrapped in a Redux store and a navigation context whose
 * `isFocused` is pinned to the given value, so tests can exercise focus-driven
 * behaviour without going through a real navigator.
 */
export const renderComponentWithStoreAndNavigationContextForFocus = <T,>(
  component: React.ReactElement<T>,
  isFocused: boolean
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  const navContext = {
    ...jest.requireActual("@react-navigation/native").navigation,
    navigate: () => null,
    dangerouslyGetState: () => null,
    setOptions: () => null,
    addListener: () => () => null,
    isFocused: () => isFocused
  };
  const Wrapper = ({ children }: PropsWithChildren<any>) => (
    <Provider store={store}>
      {/* The spread is load-bearing: a fresh value each render is what makes
          `rerender` propagate to consumers, which the focus tests rely on. */}
      {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
      <NavigationContext.Provider value={{ ...navContext }}>
        {children}
      </NavigationContext.Provider>
    </Provider>
  );

  return render(component, {
    wrapper: Wrapper
  });
};

import { createStore } from "redux";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { NavigationContext } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";

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
      <NavigationContext.Provider
        value={{
          ...navContext
        }}
      >
        {children}
      </NavigationContext.Provider>
    </Provider>
  );

  return render(component, {
    wrapper: Wrapper
  });
};

describe("testUtils", () => {
  it("Empty placeholder test for messages utilities", () => {
    expect(true).toBe(true);
  });
});

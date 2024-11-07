/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Provider } from "react-redux";
import React, { JSXElementConstructor } from "react";
import { createStore } from "redux";
import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";
import CieIdLoginWebView from "../components/CieIdLoginWebView";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import ROUTES from "../../../navigation/routes";
import * as loginHooks from "../../lollipop/hooks/useLollipopLoginSource";
import * as authSelectors from "../../../store/reducers/authentication";

const mockReplace = jest.fn();

jest.mock("@react-navigation/stack", () => ({ createStackNavigator: jest.fn }));
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    replace: mockReplace
  })
}));

describe(CieIdLoginWebView, () => {
  const spyOnUseLollipopLoginSource = jest.spyOn(
    loginHooks,
    "useLollipopLoginSource"
  );
  afterEach(jest.clearAllMocks);
  it("Should match the snapshot", () => {
    jest
      .spyOn(Linking, "addEventListener")
      // @ts-ignore
      .mockReturnValue({ remove: jest.fn() });
    const component = render(<CieWebview spidLevel="SpidL2" isUat={false} />);
    expect(component).toMatchSnapshot();
  });
  it("Should cancel the operation and navigate to the auth CieID error screen", () => {
    // @ts-ignore
    spyOnUseLollipopLoginSource.mockReturnValue(() => ({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: undefined
    }));
    const { getByTestId, queryByTestId } = render(
      <CieWebview spidLevel="SpidL2" isUat={false} />
    );
    const idpScreen = queryByTestId("idp-successful-authentication");
    expect(idpScreen).toBeFalsy();

    const cancelButton = getByTestId("loadingSpinnerOverlayCancelButton");
    fireEvent.press(cancelButton);

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_ERROR
    });
  });
  it("Should display the IdpSuccessfulAuthentication screen", () => {
    jest
      .spyOn(authSelectors, "loggedInAuthSelector")
      // @ts-ignore
      .mockReturnValue(() => true);
    const { findByTestId } = render(
      <CieWebview spidLevel="SpidL2" isUat={false} />
    );
    const idpScreen = findByTestId("idp-successful-authentication");

    expect(idpScreen).toBeTruthy();
  });
});

const CieWebview = withStore(CieIdLoginWebView);
/**
 * A HOC to provide the redux `Context`
 * @param Component the component to wrap
 * @returns The given `Component` wrapped with the redux `Provider`
 */
function withStore<P extends Record<string, unknown>>(
  Component: JSXElementConstructor<P>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return (props: P) => (
    <Provider store={store}>
      <Component {...props} />
    </Provider>
  );
}

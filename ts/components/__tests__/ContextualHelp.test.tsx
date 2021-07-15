import React from "react";
import { NavigationParams } from "react-navigation";
import { BackHandler, Text } from "react-native";
import { createStore } from "redux";
import { fireEvent, RenderAPI } from "@testing-library/react-native";

import { applicationChangeState } from "../../store/actions/application";
import { GlobalState } from "../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../utils/testWrapper";
import ROUTES from "../../navigation/routes";
import { appReducer } from "../../store/reducers";
import { ContextualHelp } from "../ContextualHelp";

jest.useFakeTimers();

const options = {
  title: "a title",
  body: jest.fn(),
  onClose: jest.fn()
};

/**
 * Finds the first button with iconName as a child.
 * Behaves as getAll*
 *
 * TODO: this helper is a stub for further development around an a11y-oriented
 * library that can be shared across projects.
 */
function buttonByIconName(iconName: string, renderAPI: RenderAPI) {
  return renderAPI.getAllByRole("button").find(
    button =>
      !!button.children.find(child => {
        if (typeof child !== "string") {
          return child.props.name === iconName;
        }
        return false;
      })
  );
}

describe("ContextualHelp component", () => {
  it("should render a button with the 'io-close' icon", () => {
    const component = renderComponent(options);
    // ensure that the close icon is inside an accessible button
    expect(buttonByIconName("io-close", component)).toBeDefined();
  });

  describe("when the close button is pressed", () => {
    it("should call `onClose`", () => {
      const onClose = jest.fn();
      const component = renderComponent({ ...options, onClose });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const closeButton = buttonByIconName("io-close", component)!;
      fireEvent(closeButton, "onPress");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should render the body", () => {
    const body = jest.fn(() => <Text>{"a very small body"}</Text>);
    const component = renderComponent({ ...options, body });
    expect(body).toHaveBeenCalledTimes(1);
    expect(component.getByText("a very small body")).toBeDefined();
  });

  it("should render the title", () => {
    const component = renderComponent(options);
    expect(component.getByText(options.title)).toBeDefined();
  });

  it("should listen for the `hardwareBackPress` event and clean it up on unmount", () => {
    const addEventSpy = jest.spyOn(BackHandler, "addEventListener");
    const removeEventSpy = jest.spyOn(BackHandler, "removeEventListener");
    const component = renderComponent(options);
    expect(addEventSpy).toHaveBeenLastCalledWith(
      "hardwareBackPress",
      expect.any(Function)
    );
    component.unmount();
    expect(removeEventSpy).toHaveBeenLastCalledWith(
      "hardwareBackPress",
      expect.any(Function)
    );
  });
});

function renderComponent(props: React.ComponentProps<typeof ContextualHelp>) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <ContextualHelp {...props} />,
    ROUTES.WALLET_CHECKOUT_3DS_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
}

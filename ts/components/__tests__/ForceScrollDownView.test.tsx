/* eslint-disable functional/immutable-data */
import { fireEvent, render } from "@testing-library/react-native";
import React, { PropsWithChildren } from "react";
import { Text } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { ForceScrollDownView } from "../ForceScrollDownView";

describe("ForceScrollDownView", () => {
  jest.useFakeTimers();

  it("renders the content correctly", () => {
    const tContent = "Some content";
    const tChildren = <Text>{tContent}</Text>;

    const { getByText } = renderComponent(
      <ForceScrollDownView>{tChildren}</ForceScrollDownView>
    );

    expect(getByText(tContent)).toBeDefined();
  });

  it("displays the scroll down button when necessary", async () => {
    const tContent = "Some content";
    const tChildren = <Text>{tContent}</Text>;

    const tScreenHeight = 1000;

    const { getByTestId, queryByTestId } = renderComponent(
      <ForceScrollDownView>{tChildren}</ForceScrollDownView>
    );

    const scrollView = getByTestId("ScrollView");

    // Update scroll view height
    fireEvent(scrollView, "layout", {
      nativeEvent: {
        layout: {
          height: tScreenHeight
        }
      }
    });

    // Update scroll view content height
    fireEvent(scrollView, "contentSizeChange", null, tScreenHeight - 500);

    // Button should not be visible because content does not need scrolling
    const buttonBefore = queryByTestId("ScrollDownButton");
    expect(buttonBefore).toBeNull();

    // Increase content height to force button to be shown
    fireEvent(scrollView, "contentSizeChange", null, tScreenHeight + 500);

    jest.advanceTimersByTime(500);

    // Button should be visible now beacuse content needs scrolling
    const buttonAfter = queryByTestId("ScrollDownButton");
    expect(buttonAfter).not.toBeNull();
  });

  it("scrolls to the bottom when the button is pressed", () => {
    const tContent = "Some content";
    const tChildren = <Text>{tContent}</Text>;

    const tScreenHeight = 1000;

    const { getByTestId, queryByTestId } = renderComponent(
      <ForceScrollDownView>{tChildren}</ForceScrollDownView>
    );

    const scrollView = getByTestId("ScrollView");

    // Update scroll view height
    fireEvent(scrollView, "layout", {
      nativeEvent: {
        layout: {
          height: tScreenHeight
        }
      }
    });

    // Update scroll view content height
    fireEvent(scrollView, "contentSizeChange", null, tScreenHeight + 500);

    // Button should be visible
    const buttonBefore = getByTestId("ScrollDownButton");
    expect(buttonBefore).not.toBeNull();

    // Fire button press event
    fireEvent.press(buttonBefore);

    // Wait for the scroll animation
    jest.advanceTimersByTime(500);

    // Button should not be visible after scrolling
    const buttonAfter = queryByTestId("ScrollDownButton");
    expect(buttonAfter).toBeNull();
  });
});

export const renderComponent = (component: React.ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  const Wrapper = ({ children }: PropsWithChildren<any>) => (
    <Provider store={store}>{children}</Provider>
  );

  return render(component, {
    wrapper: Wrapper
  });
};

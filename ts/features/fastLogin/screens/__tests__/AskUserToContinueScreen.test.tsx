import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { Store, createStore } from "redux";
import * as _ from "lodash";
import type { IOPictograms } from "@pagopa/io-app-design-system";
import AskUserInteractionScreen, { Props } from "../AskUserInterarctionScreen";
import { GlobalState } from "../../../../store/reducers/types";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";

jest.useFakeTimers();

const globalState = appReducer(undefined, applicationChangeState("active"));
const store = createStore(appReducer, globalState as any);

const defaultProps = {
  title: "Test title",
  subtitle: "Test subtitle",
  pictogramName: "timeout" as IOPictograms,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  onCancel: jest.fn(),
  onTimerExpired: jest.fn(),
  timerDurationInSeconds: 10
};

describe("AskUserInteractionScreen component", () => {
  it("should render properly", () => {
    const { getByText, getByTestId } = renderComponent(defaultProps, store);

    expect(getByText(defaultProps.title)).toBeTruthy();
    expect(getByText(defaultProps.subtitle)).toBeTruthy();
    const continueButton = getByText("Continue");
    const cancelButton = getByText("Cancel");
    const headerCloseButton = getByTestId("header-close-button");
    const countdownTimer = getByText("00:10");
    expect(continueButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();
    expect(headerCloseButton).toBeTruthy();
    expect(countdownTimer).toBeTruthy();
    expect(getByTestId("countdown-timer")).toBeTruthy();
  });

  it("should call onSubmit when the continue button is pressed", () => {
    const { getByText } = renderComponent(defaultProps, store);
    const button = getByText("Continue");
    fireEvent.press(button);
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it("should call onCancel when the exit button is pressed", () => {
    const { getByText } = renderComponent(defaultProps, store);
    const button = getByText("Cancel");
    fireEvent.press(button);
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("should call onClose when the close button is pressed", () => {
    const { getByTestId } = renderComponent(defaultProps, store);
    const button = getByTestId("header-close-button");
    fireEvent.press(button);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("does not render exit button if onExit prop is not provided", () => {
    const { queryByText } = renderComponent(
      _.omit(defaultProps, "onCancel"),
      store
    );
    expect(queryByText("Cancel")).toBeNull();
  });

  it("does not render close button if onExit prop is not provided", () => {
    const { queryByTestId } = renderComponent(
      _.omit(defaultProps, "onClose"),
      store
    );
    expect(queryByTestId("header-close-button")).toBeNull();
  });

  it("does not render timer if onTimerExpired prop is not provided", () => {
    const { queryByTestId } = renderComponent(
      _.omit(defaultProps, "onTimerExpired"),
      store
    );
    expect(queryByTestId("countdown-timer")).toBeNull();
  });

  it("should call onTimerExpired when the timer expires", async () => {
    renderComponent(defaultProps, store);

    await act(() => {
      jest.advanceTimersByTime(10 * 1000);
    });

    expect(defaultProps.onTimerExpired).toHaveBeenCalled();
  });
});

const renderComponent = (props: Props, store: Store<GlobalState>) =>
  render(
    <Provider store={store}>
      <AskUserInteractionScreen {...props} />
    </Provider>
  );

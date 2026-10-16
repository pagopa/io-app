import { fireEvent, render } from "@testing-library/react-native";

import { LollipopPlaygroundState } from "../LollipopPlayground";
import LollipopPlaygroundContent from "../LollipopPlaygroundContent";

const basePlaygroundState: LollipopPlaygroundState = {
  doSignBody: true,
  isVerificationSuccess: undefined,
  verificationResult: undefined
};

const renderComponent = (
  playgroundState: LollipopPlaygroundState = basePlaygroundState
) => {
  const onCheckBoxPress = jest.fn();
  const onClearButtonPress = jest.fn();
  const onSignButtonPress = jest.fn();

  const utils = render(
    <LollipopPlaygroundContent
      onCheckBoxPress={onCheckBoxPress}
      onClearButtonPress={onClearButtonPress}
      onSignButtonPress={onSignButtonPress}
      playgroundState={playgroundState}
    />
  );

  const signButton = utils.getByLabelText("Sign message with body");
  const clearButton = utils.getByLabelText("Clear");

  return {
    ...utils,
    onClearButtonPress,
    onSignButtonPress,
    signButton,
    clearButton
  };
};

describe("LollipopPlaygroundContent", () => {
  it("should keep the sign and clear buttons disabled when the body is empty", () => {
    const { signButton, clearButton } = renderComponent();

    expect(signButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("should keep the sign and clear buttons disabled when the body is only whitespace", () => {
    const { getByPlaceholderText, signButton, clearButton } = renderComponent();

    fireEvent.changeText(
      getByPlaceholderText("paste your body message here"),
      "   "
    );

    expect(signButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("should enable the sign and clear buttons when the body is not empty", () => {
    const {
      getByPlaceholderText,
      signButton,
      clearButton,
      onSignButtonPress,
      onClearButtonPress
    } = renderComponent();

    fireEvent.changeText(
      getByPlaceholderText("paste your body message here"),
      "hello"
    );

    expect(signButton).not.toBeDisabled();
    expect(clearButton).not.toBeDisabled();

    fireEvent.press(signButton);
    expect(onSignButtonPress).toHaveBeenCalledWith("hello");

    fireEvent.press(clearButton);
    expect(onClearButtonPress).toHaveBeenCalled();
  });
});

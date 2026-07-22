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

  return { ...utils, onCheckBoxPress, onClearButtonPress, onSignButtonPress };
};

describe("LollipopPlaygroundContent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should not call onSignButtonPress when the body is empty", () => {
    const { getByLabelText, onSignButtonPress } = renderComponent();

    fireEvent.press(getByLabelText("Sign message with body"));

    expect(onSignButtonPress).not.toHaveBeenCalled();
  });

  it("should not call onSignButtonPress when the body is only whitespace", () => {
    const { getByLabelText, getByPlaceholderText, onSignButtonPress } =
      renderComponent();

    fireEvent.changeText(
      getByPlaceholderText("paste your body message here"),
      "   "
    );
    fireEvent.press(getByLabelText("Sign message with body"));

    expect(onSignButtonPress).not.toHaveBeenCalled();
  });

  it("should call onSignButtonPress with the typed text when the body is not empty", () => {
    const { getByLabelText, getByPlaceholderText, onSignButtonPress } =
      renderComponent();

    fireEvent.changeText(
      getByPlaceholderText("paste your body message here"),
      "hello"
    );
    fireEvent.press(getByLabelText("Sign message with body"));

    expect(onSignButtonPress).toHaveBeenCalledWith("hello");
  });

  it("should not call onClearButtonPress when the body is empty", () => {
    const { getByLabelText, onClearButtonPress } = renderComponent();

    fireEvent.press(getByLabelText("Clear"));

    expect(onClearButtonPress).not.toHaveBeenCalled();
  });

  it("should call onClearButtonPress when the body is not empty", () => {
    const { getByLabelText, getByPlaceholderText, onClearButtonPress } =
      renderComponent();

    fireEvent.changeText(
      getByPlaceholderText("paste your body message here"),
      "hello"
    );
    fireEvent.press(getByLabelText("Clear"));

    expect(onClearButtonPress).toHaveBeenCalled();
  });
});

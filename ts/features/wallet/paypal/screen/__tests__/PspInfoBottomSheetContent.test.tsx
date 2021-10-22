import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { PspInfoBottomSheetContent } from "../../components/PspInfoBottomSheet";

jest.mock("@gorhom/bottom-sheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react-native");
  return {
    __esModule: true,
    BottomSheetScrollView: react.ScrollView,
    TouchableWithoutFeedback: react.TouchableWithoutFeedback
  };
});

const mockOnPress = jest.fn();
const props = {
  pspName: "pspNameTest",
  pspFee: 123 as NonNegativeNumber,
  pspPrivacyUrl: "privacyUrlTest",
  pspTosUrl: "pspTosUrl",
  onButtonPress: mockOnPress
};

describe("PspInfoBottomSheetContent", () => {
  jest.useFakeTimers();
  it(`component should be defined`, () => {
    const renderComponent = render(<PspInfoBottomSheetContent {...props} />);
    expect(
      renderComponent.queryByTestId("PspInfoBottomSheetContentTestID")
    ).not.toBeNull();
  });

  it(`footer button should be defined`, () => {
    const renderComponent = render(<PspInfoBottomSheetContent {...props} />);
    expect(renderComponent.queryByTestId("continueButtonId")).not.toBeNull();
  });

  it(`button handler should be called when the button is pressed`, () => {
    const renderComponent = render(<PspInfoBottomSheetContent {...props} />);
    const continueButton = renderComponent.queryByTestId("continueButtonId");
    expect(renderComponent.queryByTestId("continueButtonId")).not.toBeNull();
    if (continueButton) {
      fireEvent.press(continueButton);
      expect(mockOnPress).toBeCalledTimes(1);
    }
  });
});

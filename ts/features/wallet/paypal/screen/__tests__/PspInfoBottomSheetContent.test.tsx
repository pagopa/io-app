import { render } from "@testing-library/react-native";
import React from "react";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { constNull } from "fp-ts/lib/function";
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

describe("PspInfoBottomSheetContent", () => {
  jest.useFakeTimers();
  it(`component should be defined`, () => {
    const props = {
      pspName: "pspNameTest",
      pspFee: 123 as NonNegativeNumber,
      pspPrivacyUrl: "privacyUrlTest",
      onButtonPress: constNull
    };
    const renderComponent = render(<PspInfoBottomSheetContent {...props} />);
    expect(renderComponent.queryByTestId("continueButtonId")).not.toBeNull();
  });
});

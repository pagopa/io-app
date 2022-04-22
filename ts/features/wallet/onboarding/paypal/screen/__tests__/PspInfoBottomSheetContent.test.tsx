import { render } from "@testing-library/react-native";
import React from "react";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { PspInfoBottomSheetContent } from "../../components/PspInfoBottomSheet";

const props = {
  pspName: "pspNameTest",
  pspFee: 123 as NonNegativeNumber,
  pspPrivacyUrl: "privacyUrlTest",
  pspTosUrl: "pspTosUrl"
};

describe("PspInfoBottomSheetContent", () => {
  jest.useFakeTimers();
  it(`component should be defined`, () => {
    const renderComponent = render(<PspInfoBottomSheetContent {...props} />);
    expect(
      renderComponent.queryByTestId("PspInfoBottomSheetContentTestID")
    ).not.toBeNull();
  });
});

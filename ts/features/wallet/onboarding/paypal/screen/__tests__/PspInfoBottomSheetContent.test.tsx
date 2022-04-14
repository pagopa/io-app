import { render } from "@testing-library/react-native";
import React from "react";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { PspInfoBottomSheetContent } from "../../components/PspInfoBottomSheet";

jest.mock("@gorhom/bottom-sheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rn = require("react-native");

  return {
    __esModule: true,
    BottomSheetModal: rn.Modal,
    BottomSheetScrollView: rn.ScrollView,
    TouchableWithoutFeedback: rn.TouchableWithoutFeedback,
    useBottomSheetModal: () => ({
      dismissAll: jest.fn()
    }),
    namedExport: {
      ...require("react-native-reanimated/mock"),
      ...jest.requireActual("@gorhom/bottom-sheet")
    }
  };
});

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

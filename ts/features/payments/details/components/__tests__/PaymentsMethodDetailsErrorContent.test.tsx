import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { PaymentsMethodDetailsErrorContent } from "../PaymentsMethodDetailsErrorContent";

const mockDispatch = jest.fn();
const mockPop = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: () => mockDispatch,
  useIOStore: jest.fn()
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: jest.fn(),
    pop: mockPop
  })
}));

describe("PaymentsMethodDetailsErrorContent", () => {
  it("should render without crashing", () => {
    const { getByTestId } = render(<PaymentsMethodDetailsErrorContent />);
    expect(getByTestId("PaymentsMethodDetailsErrorContent")).toBeDefined();
  });

  it("should call navigation.pop when primary action is pressed", () => {
    const { getByText } = render(<PaymentsMethodDetailsErrorContent />);

    const primaryButton = getByText(
      I18n.t("wallet.methodDetails.error.primaryButton")
    );
    fireEvent.press(primaryButton);

    expect(mockPop).toHaveBeenCalled();
  });
});

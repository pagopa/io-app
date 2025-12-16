import { render, fireEvent } from "@testing-library/react-native";
import { PaymentListItemInfo } from "../PaymentListItemInfo";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";

jest.mock("../../../../../utils/clipboard", () => ({
  clipboardSetStringWithFeedback: jest.fn()
}));

describe("PaymentListItemInfo", () => {
  const mockClipboard = clipboardSetStringWithFeedback as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should copy `value` when long-pressed and `copyableValue` is not provided", () => {
    const { getByTestId } = render(
      <PaymentListItemInfo testID="listItem" value="value" />
    );

    fireEvent(getByTestId("listItem"), "onLongPress");

    expect(mockClipboard).toHaveBeenCalledWith("value");
  });

  it("should copy `copyableValue` when provided", () => {
    const { getByTestId } = render(
      <PaymentListItemInfo
        testID="listItem"
        value="displayed value"
        copyableValue="copied value"
      />
    );

    fireEvent(getByTestId("listItem"), "onLongPress");

    expect(mockClipboard).toHaveBeenCalledWith("copied value");
  });

  it("should not call clipboard function when `copyable` is false", () => {
    const { getByTestId } = render(
      <PaymentListItemInfo
        testID="listItem"
        value="any value"
        copyable={false}
      />
    );

    fireEvent(getByTestId("listItem"), "onLongPress");

    expect(mockClipboard).not.toHaveBeenCalled();
  });

  it("should not throw when value is not a string", () => {
    const { getByTestId } = render(
      <PaymentListItemInfo testID="listItem" value={42 as any} />
    );

    fireEvent(getByTestId("listItem"), "onLongPress");

    expect(mockClipboard).not.toHaveBeenCalled();
  });
});

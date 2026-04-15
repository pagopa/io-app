import { fireEvent, render } from "@testing-library/react-native";
import { sendAarErrorSupportBottomSheetComponent } from "../sendAarErrorSupportBottomSheetComponent";
import * as AnalyticsModule from "../../../analytics";
import * as ClipboardModule from "../../../../../../utils/clipboard";

jest.mock("i18next", () => ({
  t: (s: string) => s
}));

jest.mock("../../../../../../utils/clipboard", () => ({
  clipboardSetStringWithFeedback: jest.fn()
}));

jest.mock("../../../analytics", () => ({
  trackSendAarErrorScreenDetailsCode: jest.fn()
}));

const mockOnAssistancePress = jest.fn();
const mockOnCopyToClipboardPress = jest.fn();

describe("sendAarErrorSupportBottomSheetComponent", () => {
  afterEach(jest.clearAllMocks);

  it("should match the snapshot without error code", () => {
    const component = render(
      sendAarErrorSupportBottomSheetComponent(mockOnAssistancePress)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot with error code", () => {
    const component = render(
      sendAarErrorSupportBottomSheetComponent(
        mockOnAssistancePress,
        "ERROR_123",
        mockOnCopyToClipboardPress
      )
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should not render the error code section when assistanceErrorCode is undefined", () => {
    const { queryByTestId } = render(
      sendAarErrorSupportBottomSheetComponent(mockOnAssistancePress)
    );
    expect(queryByTestId("error_code_section_header")).toBeNull();
    expect(queryByTestId("error_code_value")).toBeNull();
  });

  it("should render the error code section when assistanceErrorCode is provided", () => {
    const { getByTestId } = render(
      sendAarErrorSupportBottomSheetComponent(
        mockOnAssistancePress,
        "ERROR_456"
      )
    );
    expect(getByTestId("error_code_section_header")).toBeDefined();
    expect(getByTestId("error_code_value")).toBeDefined();
  });

  it("should call onAssistancePress when the assistance button is pressed", () => {
    const { getByTestId } = render(
      sendAarErrorSupportBottomSheetComponent(mockOnAssistancePress)
    );

    expect(mockOnAssistancePress).not.toHaveBeenCalled();

    fireEvent.press(getByTestId("button_assistance"));

    expect(mockOnAssistancePress).toHaveBeenCalledTimes(1);
  });

  describe("error code copy action", () => {
    const errorCode = "COPY_ERROR_789";

    it("should call trackSendAarErrorScreenDetailsCode when the error code is pressed", () => {
      const { getByTestId } = render(
        sendAarErrorSupportBottomSheetComponent(
          mockOnAssistancePress,
          errorCode
        )
      );

      fireEvent.press(getByTestId("error_code_value"));

      expect(
        AnalyticsModule.trackSendAarErrorScreenDetailsCode
      ).toHaveBeenCalledTimes(1);
    });

    it("should call clipboardSetStringWithFeedback with the error code when the error code is pressed", () => {
      const { getByTestId } = render(
        sendAarErrorSupportBottomSheetComponent(
          mockOnAssistancePress,
          errorCode
        )
      );

      fireEvent.press(getByTestId("error_code_value"));

      expect(
        ClipboardModule.clipboardSetStringWithFeedback
      ).toHaveBeenCalledTimes(1);
      expect(
        ClipboardModule.clipboardSetStringWithFeedback
      ).toHaveBeenCalledWith(errorCode);
    });

    it("should call onCopyToClipboardPress when provided and the error code is pressed", () => {
      const { getByTestId } = render(
        sendAarErrorSupportBottomSheetComponent(
          mockOnAssistancePress,
          errorCode,
          mockOnCopyToClipboardPress
        )
      );

      expect(mockOnCopyToClipboardPress).not.toHaveBeenCalled();

      fireEvent.press(getByTestId("error_code_value"));

      expect(mockOnCopyToClipboardPress).toHaveBeenCalledTimes(1);
    });

    it("should not throw when onCopyToClipboardPress is not provided and the error code is pressed", () => {
      const { getByTestId } = render(
        sendAarErrorSupportBottomSheetComponent(
          mockOnAssistancePress,
          errorCode
        )
      );

      expect(() => {
        fireEvent.press(getByTestId("error_code_value"));
      }).not.toThrow();

      expect(
        AnalyticsModule.trackSendAarErrorScreenDetailsCode
      ).toHaveBeenCalledTimes(1);
      expect(
        ClipboardModule.clipboardSetStringWithFeedback
      ).toHaveBeenCalledWith(errorCode);
    });
  });
});

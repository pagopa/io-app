import { fireEvent, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as HOOKS from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as CLIPBOARD from "../../../../../../utils/clipboard";
import * as BOTTOM_SHEET from "../../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import PN_ROUTES from "../../../../navigation/routes";
import * as FLOW_MANAGER from "../../../hooks/useSendAarFlowManager";
import { sendAarMockStateFactory } from "../../../utils/testUtils";
import {
  SendAARErrorComponent,
  testable
} from "../../errors/SendAARErrorComponent";

const { bottomComponent } = testable!;

const managerSpy = jest.spyOn(FLOW_MANAGER, "useSendAarFlowManager");
jest.mock("../../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../../store/hooks"),
  useIOSelector: jest.fn()
}));

describe("SendAARErrorComponent - Full Test Suite", () => {
  const mockGoNextState = jest.fn();
  const mockTerminateFlow = jest.fn();
  const mockAssistance = jest.fn();

  const errorCode = "VERY_LONG_AND_NOT_DESCRIPTIVE_ERROR_CODE";

  beforeEach(() => {
    managerSpy.mockImplementation(() => ({
      currentFlowData: sendAarMockStateFactory.ko(),
      goToNextState: mockGoNextState,
      terminateFlow: mockTerminateFlow
    }));
    (HOOKS.useIOSelector as jest.Mock).mockReturnValue(errorCode);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("quits out of the flow on primary button press", () => {
    const { getByTestId } = renderComponent();
    const button = getByTestId("primary_button");
    fireEvent.press(button);
    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
  });

  it("calls present() on secondary button press", () => {
    const renderedBottomComponent = bottomComponent(() => undefined, errorCode);

    const presentMock = jest.fn();
    const dismissMock = jest.fn();
    jest.spyOn(BOTTOM_SHEET, "useIOBottomSheetModal").mockReturnValue({
      bottomSheet: renderedBottomComponent,
      present: presentMock,
      dismiss: dismissMock
    });

    const { getByTestId } = renderComponent();
    const button = getByTestId("secondary_button");
    fireEvent.press(button);
    expect(presentMock).toHaveBeenCalledTimes(1);
  });

  it("calls present() on assistance button press", () => {
    const renderedBottomComponent = bottomComponent(mockAssistance, errorCode);

    const presentMock = jest.fn();
    const dismissMock = jest.fn();
    jest.spyOn(BOTTOM_SHEET, "useIOBottomSheetModal").mockReturnValue({
      bottomSheet: renderedBottomComponent,
      present: presentMock,
      dismiss: dismissMock
    });

    const { getByTestId } = renderComponent();
    const button = getByTestId("button_assistance");
    fireEvent.press(button);
    expect(mockAssistance).toHaveBeenCalledTimes(1);
  });

  it("renders error codes when flow is 'ko'", () => {
    const { getByText } = renderComponent();
    expect(getByText(errorCode)).toBeTruthy();
  });

  it("copies error codes to clipboard on press", async () => {
    const clipboardSpy = jest.spyOn(
      CLIPBOARD,
      "clipboardSetStringWithFeedback"
    );

    const { getByText } = renderComponent();
    const copyButton = getByText(errorCode);

    fireEvent.press(copyButton);

    await waitFor(() => {
      expect(clipboardSpy).toHaveBeenCalledWith(errorCode);
    });
  });

  it("does not render error code section when errorCodes is empty", async () => {
    managerSpy.mockImplementation(() => ({
      currentFlowData: {
        ...sendAarMockStateFactory.ko(),
        errorCodes: []
      },
      goToNextState: mockGoNextState,
      terminateFlow: mockTerminateFlow
    }));

    jest
      .spyOn(BOTTOM_SHEET, "useIOBottomSheetModal")
      .mockImplementation(() => ({
        bottomSheet: bottomComponent(() => undefined),
        present: jest.fn(),
        dismiss: jest.fn()
      }));

    const { queryByTestId } = renderComponent();

    await waitFor(() => {
      expect(queryByTestId("error_code_section_header")).toBeNull();
      expect(queryByTestId("error_code_value")).toBeNull();
    });
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARErrorComponent />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};

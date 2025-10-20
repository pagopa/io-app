import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as DISPATCH from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as CLIPBOARD from "../../../../../../utils/clipboard";
import * as BOTTOM_SHEET from "../../../../../../utils/hooks/bottomSheet";
import * as SUPPORT_ASSISTANCE from "../../../../../../utils/supportAssistance";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../../../zendesk/store/actions";
import PN_ROUTES from "../../../../navigation/routes";
import * as FLOW_MANAGER from "../../../hooks/useSendAarFlowManager";
import * as SELECTORS from "../../../store/selectors";
import { sendAarMockStateFactory } from "../../../utils/testUtils";
import {
  SendAARErrorComponent,
  testable
} from "../../errors/SendAARErrorComponent";

const { bottomComponent } = testable!;

const managerSpy = jest.spyOn(FLOW_MANAGER, "useSendAarFlowManager");

describe("SendAARErrorComponent - Full Test Suite", () => {
  const mockGoNextState = jest.fn();
  const mockTerminateFlow = jest.fn();
  const mockAssistance = jest.fn();

  const assistanceErrorCode = "VERY_LONG_AND_NOT_DESCRIPTIVE_ERROR_CODE";

  beforeEach(() => {
    managerSpy.mockImplementation(() => ({
      currentFlowData: sendAarMockStateFactory.ko(),
      goToNextState: mockGoNextState,
      terminateFlow: mockTerminateFlow
    }));

    jest
      .spyOn(SELECTORS, "currentAARFlowStateAssistanceErrorCode")
      .mockReturnValue(assistanceErrorCode);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("quits out of the flow on primary button press", () => {
    const { getByTestId } = renderComponent();
    const button = getByTestId("primary_button");
    fireEvent.press(button);
    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
  });

  it("calls present() on secondary button press", () => {
    const presentMock = jest.fn();
    const dismissMock = jest.fn();
    jest.spyOn(BOTTOM_SHEET, "useIOBottomSheetModal").mockReturnValue({
      bottomSheet: <></>,
      present: presentMock,
      dismiss: dismissMock
    });

    const { getByTestId } = renderComponent();
    const button = getByTestId("secondary_button");
    fireEvent.press(button);
    expect(presentMock).toHaveBeenCalledTimes(1);
  });

  it("calls present() on assistance button press", () => {
    const renderedBottomComponent = bottomComponent(
      mockAssistance,
      assistanceErrorCode
    );

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
    expect(getByText(assistanceErrorCode)).toBeTruthy();
  });

  it("copies error codes to clipboard on press", async () => {
    const clipboardSpy = jest.spyOn(
      CLIPBOARD,
      "clipboardSetStringWithFeedback"
    );

    const { getByText } = renderComponent();
    const copyButton = getByText(assistanceErrorCode);

    fireEvent.press(copyButton);

    expect(clipboardSpy).toHaveBeenCalledWith(assistanceErrorCode);
  });

  it("does not render error code section when assistanceErrorCode is empty", async () => {
    jest
      .spyOn(SELECTORS, "currentAARFlowStateAssistanceErrorCode")
      .mockReturnValue(undefined);

    const { queryByTestId } = renderComponent();

    // We can't make a direct comparison with the result of queryByTestId because when it fails, it returns an issue related to the navigation context (which is actually correct), instead of reporting the specific failure of the test.
    expect(queryByTestId("error_code_section_header") == null).toBe(true);
    expect(queryByTestId("error_code_value") == null).toBe(true);
  });

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("zendeskAssistanceLogAndStart calls expected functions in order", () => {
    const mockDispatch = jest.fn();
    jest
      .spyOn(DISPATCH, "useIODispatch")
      .mockImplementation(() => mockDispatch);

    const refUseIOBottomSheetModal = BOTTOM_SHEET.useIOBottomSheetModal;
    const dismissMock = jest.fn();
    jest
      .spyOn(BOTTOM_SHEET, "useIOBottomSheetModal")
      .mockImplementation(props => {
        const { present, bottomSheet } = refUseIOBottomSheetModal(props);

        return { present, bottomSheet, dismiss: dismissMock };
      });

    const resetCustomFields = jest.spyOn(
      SUPPORT_ASSISTANCE,
      "resetCustomFields"
    );
    const resetLog = jest.spyOn(SUPPORT_ASSISTANCE, "resetLog");
    const addTicketCustomField = jest.spyOn(
      SUPPORT_ASSISTANCE,
      "addTicketCustomField"
    );
    const appendLog = jest.spyOn(SUPPORT_ASSISTANCE, "appendLog");

    const { getByTestId } = renderComponent();
    const buttonAssistance = getByTestId("button_assistance");
    fireEvent.press(buttonAssistance);

    expect(dismissMock).toHaveBeenCalledTimes(1);

    expect(resetCustomFields).toHaveBeenCalledTimes(1);

    expect(resetLog).toHaveBeenCalledTimes(1);

    expect(addTicketCustomField.mock.calls.length).toBe(2);
    expect(addTicketCustomField.mock.calls[0].length).toBe(2);
    expect(addTicketCustomField.mock.calls[0][0]).toBe(
      SUPPORT_ASSISTANCE.zendeskCategoryId
    );
    expect(addTicketCustomField.mock.calls[0][1]).toBe(
      SUPPORT_ASSISTANCE.zendeskSendCategory.value
    );
    expect(addTicketCustomField.mock.calls[1][0]).toBe("39752564743313");
    expect(addTicketCustomField.mock.calls[1][1]).toBe(
      "io_problema_notifica_send_qr"
    );

    expect(appendLog).toHaveBeenCalledTimes(1);
    expect(appendLog).toHaveBeenCalledWith(JSON.stringify(assistanceErrorCode));

    expect(mockDispatch.mock.calls.length).toBe(2);
    expect(mockDispatch.mock.calls[0].length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toEqual(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceType: {
          send: true
        }
      })
    );
    expect(mockDispatch.mock.calls[1].length).toBe(1);
    expect(mockDispatch.mock.calls[1][0]).toEqual(
      zendeskSelectedCategory(SUPPORT_ASSISTANCE.zendeskSendCategory)
    );

    // order test for assistance api
    expect(resetCustomFields.mock.invocationCallOrder[0]).toBeLessThan(
      resetLog.mock.invocationCallOrder[0]
    );
    expect(resetLog.mock.invocationCallOrder[0]).toBeLessThan(
      addTicketCustomField.mock.invocationCallOrder[0]
    );
    expect(addTicketCustomField.mock.invocationCallOrder[0]).toBeLessThan(
      addTicketCustomField.mock.invocationCallOrder[1]
    );
    expect(addTicketCustomField.mock.invocationCallOrder[1]).toBeLessThan(
      appendLog.mock.invocationCallOrder[0]
    );
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

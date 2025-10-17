import { fireEvent, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as HOOKS from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as CLIPBOARD from "../../../../../../utils/clipboard";
import * as BOTTOM_SHEET from "../../../../../../utils/hooks/bottomSheet";
import * as supportAssistance from "../../../../../../utils/supportAssistance";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../../../zendesk/store/actions";
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

jest.mock("../../../../../../utils/supportAssistance", () => {
  const originalModule = jest.requireActual(
    "../../../../../../utils/supportAssistance"
  );
  return {
    ...originalModule,
    resetCustomFields: jest.fn(),
    resetLog: jest.fn(),
    appendLog: jest.fn(),
    addTicketCustomField: jest.fn()
  };
});

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
    (HOOKS.useIOSelector as jest.Mock).mockReturnValue(assistanceErrorCode);
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
    const renderedBottomComponent = bottomComponent(
      () => undefined,
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

    await waitFor(() => {
      expect(clipboardSpy).toHaveBeenCalledWith(assistanceErrorCode);
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

  it("zendeskAssistanceLogAndStart calls expected functions in order", () => {
    (HOOKS.useIOSelector as jest.Mock).mockReturnValue(assistanceErrorCode);

    const dispatchMock = jest.fn();
    jest.spyOn(HOOKS, "useIODispatch").mockReturnValue(dispatchMock);

    const dismissMock = jest.fn();

    const mockZendeskAssistanceLogAndStart = () => {
      dismissMock();
      supportAssistance.resetCustomFields();
      supportAssistance.resetLog();
      supportAssistance.addTicketCustomField(
        supportAssistance.zendeskCategoryId,
        supportAssistance.zendeskSendCategory.value
      );
      supportAssistance.addTicketCustomField(
        "39752564743313",
        "io_problema_notifica_send_qr"
      );
      supportAssistance.appendLog(JSON.stringify(assistanceErrorCode));
      dispatchMock(
        zendeskSupportStart({
          startingRoute: "n/a",
          assistanceType: { send: true }
        })
      );
      dispatchMock(
        zendeskSelectedCategory(supportAssistance.zendeskSendCategory)
      );
    };

    const renderedBottomComponent = bottomComponent(
      mockZendeskAssistanceLogAndStart,
      assistanceErrorCode
    );

    jest.spyOn(BOTTOM_SHEET, "useIOBottomSheetModal").mockReturnValue({
      bottomSheet: renderedBottomComponent,
      present: jest.fn(),
      dismiss: dismissMock
    });

    const { getByTestId } = renderComponent();

    const secondary = getByTestId("secondary_button");
    fireEvent.press(secondary);

    const assistance = getByTestId("button_assistance");
    fireEvent.press(assistance);

    expect(dismissMock).toHaveBeenCalled();

    expect(supportAssistance.resetCustomFields).toHaveBeenCalled();
    expect(supportAssistance.resetLog).toHaveBeenCalled();
    expect(supportAssistance.addTicketCustomField).toHaveBeenCalledTimes(2);
    expect(supportAssistance.appendLog).toHaveBeenCalledWith(
      JSON.stringify(assistanceErrorCode)
    );

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ZENDESK_SUPPORT_START" })
    );
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ZENDESK_SELECTED_CATEGORY" })
    );

    const callOrder = [
      (supportAssistance.resetCustomFields as jest.Mock).mock
        .invocationCallOrder[0],
      (supportAssistance.resetLog as jest.Mock).mock.invocationCallOrder[0],
      (supportAssistance.addTicketCustomField as jest.Mock).mock
        .invocationCallOrder[0],
      (supportAssistance.addTicketCustomField as jest.Mock).mock
        .invocationCallOrder[1],
      (supportAssistance.appendLog as jest.Mock).mock.invocationCallOrder[0]
    ];

    callOrder.slice(1).forEach((current, i) => {
      const previous = callOrder[i];
      expect(previous).toBeLessThan(current);
    });
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

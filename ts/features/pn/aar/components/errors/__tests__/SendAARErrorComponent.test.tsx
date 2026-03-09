import { act, fireEvent } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import PN_ROUTES from "../../../../navigation/routes";
import * as FLOW_MANAGER from "../../../hooks/useSendAarFlowManager";
import * as SELECTORS from "../../../store/selectors";
import { sendAarMockStateFactory } from "../../../utils/testUtils";
import { SendAarGenericErrorComponent } from "../../errors/SendAARErrorComponent";
import * as debugHooks from "../../../../../../hooks/useDebugInfo";
import * as ANALYTICS from "../../../analytics";
import { useAarGenericErrorBottomSheet } from "../hooks/useAarGenericErrorBottomSheet";

jest.mock("../hooks/useAarGenericErrorBottomSheet");
const mockUseAarGenericErrorBottomSheet =
  useAarGenericErrorBottomSheet as jest.Mock<
    ReturnType<typeof useAarGenericErrorBottomSheet>,
    Parameters<typeof useAarGenericErrorBottomSheet>
  >;

const managerSpy = jest.spyOn(FLOW_MANAGER, "useSendAarFlowManager");

describe("SendAARErrorComponent - Full Test Suite", () => {
  const mockGoNextState = jest.fn();
  const mockTerminateFlow = jest.fn();
  const mockPresent = jest.fn();

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

    mockUseAarGenericErrorBottomSheet.mockReturnValue({
      bottomSheet: (
        <View>
          <Text>Bottom Sheet content</Text>
        </View>
      ),
      present: mockPresent
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("quits out of the flow on primary button press and calls trackSendAarErrorScreenClosure", () => {
    const spiedOnMockedTrackSendAarErrorScreenClosure = jest
      .spyOn(ANALYTICS, "trackSendAarErrorScreenClosure")
      .mockImplementation();

    const { getByTestId } = renderComponent();

    const button = getByTestId("primary_button");
    fireEvent.press(button);

    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);

    expect(spiedOnMockedTrackSendAarErrorScreenClosure.mock.calls.length).toBe(
      1
    );
    expect(
      spiedOnMockedTrackSendAarErrorScreenClosure.mock.calls[0].length
    ).toBe(0);
  });

  it("calls present() and trackSendAarErrorScreenDetails on secondary button press", () => {
    const spiedOnMockedTrackSendAarErrorScreenDetails = jest
      .spyOn(ANALYTICS, "trackSendAarErrorScreenDetails")
      .mockImplementation();

    const { getByTestId } = renderComponent();

    const button = getByTestId("secondary_button");
    fireEvent.press(button);

    expect(mockPresent).toHaveBeenCalledTimes(1);

    expect(spiedOnMockedTrackSendAarErrorScreenDetails.mock.calls.length).toBe(
      1
    );
    expect(
      spiedOnMockedTrackSendAarErrorScreenDetails.mock.calls[0].length
    ).toBe(0);
  });

  it('should call "useAarGenericErrorBottomSheet" with the correct parameters', () => {
    renderComponent();

    expect(mockUseAarGenericErrorBottomSheet).toHaveBeenCalledTimes(1);
    expect(mockUseAarGenericErrorBottomSheet).toHaveBeenCalledWith({
      errorName: assistanceErrorCode,
      zendeskSecondLevelTag: "io_problema_notifica_send_qr",
      onStartAssistance: expect.any(Function)
    });
  });

  it('should call "trackSendAarErrorScreenDetailsHelp" when "onStartAssistance" is invoked', () => {
    const spiedOnMockedTrackSendAarErrorScreenDetailsHelp = jest
      .spyOn(ANALYTICS, "trackSendAarErrorScreenDetailsHelp")
      .mockImplementation();

    renderComponent();

    expect(
      spiedOnMockedTrackSendAarErrorScreenDetailsHelp
    ).not.toHaveBeenCalled();

    const { onStartAssistance } =
      mockUseAarGenericErrorBottomSheet.mock.calls[0][0];

    act(() => {
      onStartAssistance!();
    });

    expect(
      spiedOnMockedTrackSendAarErrorScreenDetailsHelp
    ).toHaveBeenCalledTimes(1);
  });

  it("should match snapshot and call useDebugInfo to display proper debug data", () => {
    const fakeDebugInfo = {
      errorCodes: "830 Debug info",
      phase: "Fetch Notification",
      reason: "Something failed",
      traceId: "traceId-123"
    };
    jest
      .spyOn(SELECTORS, "currentAARFlowStateErrorDebugInfoSelector")
      .mockImplementation(_state => fakeDebugInfo);
    const spiedOnUseDebugInfo = jest.spyOn(debugHooks, "useDebugInfo");
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();

    expect(spiedOnUseDebugInfo.mock.calls.length).toBe(1);
    expect(spiedOnUseDebugInfo.mock.calls[0].length).toBe(1);
    expect(spiedOnUseDebugInfo.mock.calls[0][0]).toEqual(fakeDebugInfo);
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAarGenericErrorComponent />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};

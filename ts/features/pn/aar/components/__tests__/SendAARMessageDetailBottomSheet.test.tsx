import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import { AARFlowState, sendAARFlowStates } from "../../utils/stateUtils";
import { sendAarMockStateFactory } from "../../utils/testUtils";
import {
  SendAARMessageDetailBottomSheet,
  SendAARMessageDetailBottomSheetProps
} from "../SendAARMessageDetailBottomSheet";
import { SendUserType } from "../../../../pushNotifications/analytics";
import * as ANALYTICS from "../../analytics";
import * as REMOTE_CONFIG_SELECTORS from "../../../../../store/reducers/backendStatus/remoteConfig";
import * as SELECTORS from "../../store/selectors";
import * as URL_UTILS from "../../../../../utils/url";

type DisplayingNotificationDataState = Extract<
  AARFlowState,
  { type: typeof sendAARFlowStates.displayingNotificationData }
>;

describe("BottomSheetContent", () => {
  const mockOnPrimaryActionPress = jest.fn();
  const mockOnSecondaryActionPress = jest.fn();

  const defaultProps: SendAARMessageDetailBottomSheetProps = {
    onPrimaryActionPress: mockOnPrimaryActionPress,
    onSecondaryActionPress: mockOnSecondaryActionPress,
    sendUserType: "recipient"
  };

  const stateWithMandateId =
    sendAarMockStateFactory.displayingNotificationData() as DisplayingNotificationDataState;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const sendUserTypes: ReadonlyArray<SendUserType> = [
    "mandatory",
    "not_set",
    "recipient"
  ];

  const mockUrl = "https://example.com/test-url";

  sendUserTypes.forEach(sendUserType => {
    const isDelegate = sendUserType === "mandatory";
    it(`${
      isDelegate
        ? "doesn't render a link"
        : "calls openWebUrl when link is pressed and trackSendAarNotificationClosureExit with proper parameters"
    } and matches its snapshot when called with user type = ${sendUserType})`, () => {
      const openWebUrlSpy = jest
        .spyOn(URL_UTILS, "openWebUrl")
        .mockImplementation(jest.fn());

      jest
        .spyOn(SELECTORS, "currentAARFlowData")
        .mockImplementation(() => stateWithMandateId);
      jest
        .spyOn(REMOTE_CONFIG_SELECTORS, "sendVisitTheWebsiteUrlSelector")
        .mockImplementation(() => mockUrl);
      const spiedOnMockedTrackSendAarNotificationClosureExit = jest
        .spyOn(ANALYTICS, "trackSendAarNotificationClosureExit")
        .mockImplementation();

      const { queryByTestId, toJSON } = renderComponent({
        ...defaultProps,
        sendUserType
      });

      const linkComponent = queryByTestId("link");
      if (isDelegate) {
        expect(linkComponent).toBeFalsy();
      } else {
        expect(linkComponent).not.toBeNull();
        expect(openWebUrlSpy).toHaveBeenCalledTimes(0);
        fireEvent.press(linkComponent!); // the nullish case is handled by the previous expect

        expect(openWebUrlSpy).toHaveBeenCalledWith(mockUrl);
        expect(openWebUrlSpy).toHaveBeenCalledTimes(1);

        expect(
          spiedOnMockedTrackSendAarNotificationClosureExit.mock.calls.length
        ).toBe(1);
        expect(
          spiedOnMockedTrackSendAarNotificationClosureExit.mock.calls[0].length
        ).toBe(1);
        expect(
          spiedOnMockedTrackSendAarNotificationClosureExit.mock.calls[0][0]
        ).toBe(sendUserType);
      }
      expect(toJSON()).toMatchSnapshot();
    });
  });

  it("calls onPrimaryActionPress when primary button is pressed", () => {
    jest
      .spyOn(SELECTORS, "currentAARFlowData")
      .mockImplementation(() => stateWithMandateId);

    const { getByTestId } = renderComponent(defaultProps);
    expect(mockOnPrimaryActionPress).toHaveBeenCalledTimes(0);
    const buttonComponent = getByTestId("primary_button");
    fireEvent.press(buttonComponent);
    expect(mockOnPrimaryActionPress).toHaveBeenCalledTimes(1);
  });

  it("calls onSecondaryActionPress when secondary button is pressed", () => {
    jest
      .spyOn(SELECTORS, "currentAARFlowData")
      .mockImplementation(() => stateWithMandateId);

    const { getByTestId } = renderComponent(defaultProps);
    const buttonComponent = getByTestId("secondary_button");
    expect(mockOnSecondaryActionPress).toHaveBeenCalledTimes(0);
    fireEvent.press(buttonComponent);
    expect(mockOnSecondaryActionPress).toHaveBeenCalledTimes(1);
  });
});

const renderComponent = (props: SendAARMessageDetailBottomSheetProps) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARMessageDetailBottomSheet {...props} />,
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    createStore(appReducer, globalState as any)
  );
};

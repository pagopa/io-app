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
    userType: "recipient"
  };

  const stateWithMandateId =
    sendAarMockStateFactory.displayingNotificationData() as DisplayingNotificationDataState;

  const stateWithoutMandateId = {
    ...stateWithMandateId,
    mandateId: undefined
  } as DisplayingNotificationDataState;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const sendUserTypes: ReadonlyArray<SendUserType> = [
    "mandatory",
    "not_set",
    "recipient"
  ];

  sendUserTypes.forEach(sendUserType => {
    it(`calls openWebUrl when link is pressed and trackSendAarNotificationClosureExit with proper parameters (user type ${sendUserType})`, () => {
      const openWebUrlSpy = jest
        .spyOn(URL_UTILS, "openWebUrl")
        .mockImplementation(jest.fn());

      const mockUrl = "https://example.com/test-url";

      jest
        .spyOn(SELECTORS, "currentAARFlowData")
        .mockImplementation(() => stateWithMandateId);
      jest
        .spyOn(REMOTE_CONFIG_SELECTORS, "sendVisitTheWebsiteUrlSelector")
        .mockImplementation(() => mockUrl);
      const spiedOnMockedTrackSendAarNotificationClosureExit = jest
        .spyOn(ANALYTICS, "trackSendAarNotificationClosureExit")
        .mockImplementation();

      const { getByTestId } = renderComponent({
        ...defaultProps,
        userType: sendUserType
      });

      const linkComponent = getByTestId("link");
      expect(openWebUrlSpy).toHaveBeenCalledTimes(0);
      fireEvent.press(linkComponent);

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

  [stateWithMandateId, stateWithoutMandateId].forEach(state =>
    it(`should match snapshot when mandateId='${state.mandateId}'`, () => {
      jest
        .spyOn(SELECTORS, "currentAARFlowData")
        .mockImplementation(() => state);

      const { toJSON } = renderComponent(defaultProps);
      expect(toJSON()).toMatchSnapshot();
    })
  );
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

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
import * as REMOTE_CONFIG_SELECTORS from "../../../../../store/reducers/backendStatus/remoteConfig";
import * as SELECTORS from "../../store/selectors";

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
        ? "doesn't render the website section"
        : "renders the website section with the URL"
    } and matches its snapshot when called with user type = ${sendUserType})`, () => {
      jest
        .spyOn(SELECTORS, "currentAARFlowData")
        .mockImplementation(() => stateWithMandateId);
      jest
        .spyOn(REMOTE_CONFIG_SELECTORS, "sendVisitTheWebsiteUrlSelector")
        .mockImplementation(() => mockUrl);

      const { queryByText, toJSON } = renderComponent({
        ...defaultProps,
        sendUserType
      });

      const urlInSubtitle = queryByText(new RegExp(`\\(${mockUrl}\\)`));
      if (isDelegate) {
        expect(urlInSubtitle).toBeNull();
      } else {
        expect(urlInSubtitle).not.toBeNull();
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

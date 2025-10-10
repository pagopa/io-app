import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as URL_UTILS from "../../../../../utils/url";
import PN_ROUTES from "../../../navigation/routes";
import { AARFlowState, sendAARFlowStates } from "../../utils/stateUtils";
import { sendAarMockStateFactory } from "../../utils/testUtils";
import {
  SendAARMessageDetailBottomSheet,
  SendAARMessageDetailBottomSheetProps
} from "../SendAARMessageDetailBottomSheet";

type DisplayingNotificationDataState = Extract<
  AARFlowState,
  { type: typeof sendAARFlowStates.displayingNotificationData }
>;

describe("BottomSheetContent", () => {
  const mockOnPrimaryActionPress = jest.fn();
  const mockOnSecondaryActionPress = jest.fn();

  const defaultProps: SendAARMessageDetailBottomSheetProps = {
    onPrimaryActionPress: mockOnPrimaryActionPress,
    onSecondaryActionPress: mockOnSecondaryActionPress
  };

  const stateWithMandateId =
    sendAarMockStateFactory.displayingNotificationData() as DisplayingNotificationDataState;

  const stateWithoutMandateId = {
    ...stateWithMandateId,
    mandateId: undefined
  } as DisplayingNotificationDataState;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with a mandateId (delegate flow)", () => {
    jest.spyOn(HOOKS, "useIOSelector").mockReturnValue(stateWithMandateId);

    const { getByTestId, queryByTestId } = renderComponent(defaultProps);
    expect(getByTestId("primary_button")).toBeTruthy();
    expect(getByTestId("secondary_button")).toBeTruthy();
    expect(getByTestId("link")).toBeTruthy();
    expect(getByTestId("body_mandate")).toBeTruthy();
    expect(queryByTestId("body_nomandate")).not.toBeTruthy();
  });

  it("renders correctly without a mandateId (citizen flow)", () => {
    jest.spyOn(HOOKS, "useIOSelector").mockReturnValue(stateWithoutMandateId);

    const { getByTestId, queryByTestId } = renderComponent(defaultProps);
    expect(getByTestId("primary_button")).toBeTruthy();
    expect(getByTestId("secondary_button")).toBeTruthy();
    expect(getByTestId("link")).toBeTruthy();
    expect(getByTestId("body_nomandate")).toBeTruthy();
    expect(queryByTestId("body_mandate")).not.toBeTruthy();
  });

  it("calls openWebUrl when link is pressed", () => {
    const openWebUrlSpy = jest
      .spyOn(URL_UTILS, "openWebUrl")
      .mockImplementation(jest.fn());
    jest.spyOn(HOOKS, "useIOSelector").mockReturnValue(stateWithMandateId);

    const { getByTestId } = renderComponent(defaultProps);
    const linkComponent = getByTestId("link");
    expect(openWebUrlSpy).toHaveBeenCalledTimes(0);
    fireEvent.press(linkComponent);
    expect(openWebUrlSpy).toHaveBeenCalledWith(
      "https://cittadini.notifichedigitali.it/auth/login"
    );
    expect(openWebUrlSpy).toHaveBeenCalledTimes(1);
  });

  it("calls onPrimaryActionPress when primary button is pressed", () => {
    jest.spyOn(HOOKS, "useIOSelector").mockReturnValue(stateWithMandateId);

    const { getByTestId } = renderComponent(defaultProps);
    expect(mockOnPrimaryActionPress).toHaveBeenCalledTimes(0);
    const buttonComponent = getByTestId("primary_button");
    fireEvent.press(buttonComponent);
    expect(mockOnPrimaryActionPress).toHaveBeenCalledTimes(1);
  });

  it("calls onSecondaryActionPress when secondary button is pressed", () => {
    jest.spyOn(HOOKS, "useIOSelector").mockReturnValue(stateWithMandateId);

    const { getByTestId } = renderComponent(defaultProps);
    const buttonComponent = getByTestId("secondary_button");
    expect(mockOnSecondaryActionPress).toHaveBeenCalledTimes(0);
    fireEvent.press(buttonComponent);
    expect(mockOnSecondaryActionPress).toHaveBeenCalledTimes(1);
  });

  [stateWithMandateId, stateWithoutMandateId].forEach(state =>
    it(`should match snapshot when mandateId='${state.mandateId}'`, () => {
      jest.spyOn(HOOKS, "useIOSelector").mockReturnValue(state);

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

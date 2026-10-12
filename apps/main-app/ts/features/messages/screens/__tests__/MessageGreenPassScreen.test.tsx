import { fireEvent } from "@testing-library/react-native";
import { Action, createStore } from "redux";

import * as hookSecondLevel from "../../../../hooks/useHeaderSecondLevel";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { successGetMessageDataFor } from "../../__mocks__/messageData";
import * as ANALYTICS from "../../analytics";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { getMessageDataAction } from "../../store/actions";
import { MessageGreenPassScreen } from "../MessageGreenPassScreen";

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    goBack: mockGoBack,
    setOptions: jest.fn()
  })
}));

const MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJK";
const OTHER_MESSAGE_ID = "01HGRNT85KP8TC5APFQWAA3HJZ";

const greenPassDataFor = (messageId: string) =>
  successGetMessageDataFor(messageId, { isLegacyGreenPass: true });
describe("MessageGreenPassScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("Should match snapshost", () => {
    const messageGreenPassScreen = renderScreen();
    expect(messageGreenPassScreen.toJSON()).toMatchSnapshot();
  });
  it("Should call 'useHeaderSecondLevel' with empty title and enabled support request", () => {
    const mockUseHeaderSecondLevel = jest
      .spyOn(hookSecondLevel, "useHeaderSecondLevel")
      .mockImplementation(_ => undefined);
    renderScreen();
    expect(mockUseHeaderSecondLevel.mock.calls.length).toBe(1);
    expect(mockUseHeaderSecondLevel.mock.calls[0].length).toBe(1);
    expect(mockUseHeaderSecondLevel.mock.calls[0][0]).toEqual({
      title: "",
      supportRequest: true
    });
  });
  it("should trigger 'navigation.goBack' upon primary button action pressing", () => {
    jest
      .spyOn(hookSecondLevel, "useHeaderSecondLevel")
      .mockImplementation(_ => undefined);
    const messageGreenPassScreen = renderScreen();
    const primaryActionButton =
      messageGreenPassScreen.getByTestId("green-pass-button");
    fireEvent(primaryActionButton, "onPress");
    expect(mockGoBack.mock.calls.length).toBe(1);
  });
  it.each([false, true])(
    "should track the opening with the loaded data (fromPushNotification %s)",
    fromPushNotification => {
      const spiedTrackOpenMessage = jest
        .spyOn(ANALYTICS, "trackOpenMessageFromSuccessData")
        .mockImplementation();
      const successData = greenPassDataFor(MESSAGE_ID);

      renderScreen(
        fromPushNotification,
        getMessageDataAction.success(successData)
      );

      expect(spiedTrackOpenMessage).toHaveBeenCalledTimes(1);
      expect(spiedTrackOpenMessage).toHaveBeenCalledWith(
        successData,
        fromPushNotification
      );
    }
  );

  type NotTrackedScenario = {
    loadedState?: Action;
    name: string;
  };
  const notTrackedScenarios: ReadonlyArray<NotTrackedScenario> = [
    { name: "no message data has been loaded" },
    {
      name: "the data of another message has been loaded",
      loadedState: getMessageDataAction.success(
        greenPassDataFor(OTHER_MESSAGE_ID)
      )
    },
    {
      name: "the message data is still loading",
      loadedState: getMessageDataAction.request({
        messageId: MESSAGE_ID,
        fromPushNotification: false
      })
    }
  ];

  it.each(notTrackedScenarios)(
    "should not track the opening when $name",
    ({ loadedState }) => {
      const spiedTrackOpenMessage = jest
        .spyOn(ANALYTICS, "trackOpenMessageFromSuccessData")
        .mockImplementation();

      renderScreen(false, loadedState);

      expect(spiedTrackOpenMessage).not.toHaveBeenCalled();
    }
  );
});

const renderScreen = (fromPushNotification = false, loadedState?: Action) => {
  const activeState = appReducer(undefined, applicationChangeState("active"));
  const initialState = loadedState
    ? appReducer(activeState, loadedState)
    : activeState;
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    MessageGreenPassScreen,
    MESSAGES_ROUTES.MESSAGE_GREEN_PASS,
    { fromPushNotification, messageId: MESSAGE_ID },
    store
  );
};

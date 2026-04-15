import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MessageGreenPassScreen } from "../MessageGreenPassScreen";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import * as hookSecondLevel from "../../../../hooks/useHeaderSecondLevel";

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

describe("MessageGreenPassScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    MessageGreenPassScreen,
    MESSAGES_ROUTES.MESSAGE_GREEN_PASS,
    {},
    store
  );
};

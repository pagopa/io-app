import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as LOGIC_HOOK from "../../hooks/useAARpushEngagementScreenLogic";
import { SendQrScanPushEngagementScreen } from "../SendAARPushEngagementScreen";

describe("SendQrScanPushEngagementScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("should render a blank page when told to do so by the logic hook", () => {
    jest
      .spyOn(LOGIC_HOOK, "useAARPushEngagementScreenLogic")
      .mockImplementation(() => ({
        onButtonPress: () => null,
        shouldRenderBlankPage: true
      }));

    const component = renderScreen();

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should call the button press callback on button press", () => {
    const mockButtonPress = jest.fn();

    jest
      .spyOn(LOGIC_HOOK, "useAARPushEngagementScreenLogic")
      .mockImplementation(() => ({
        onButtonPress: mockButtonPress,
        shouldRenderBlankPage: false
      }));

    const component = renderScreen();

    expect(mockButtonPress).toHaveBeenCalledTimes(0);

    const button = component.getByTestId("engagement-cta");
    fireEvent(button, "press");

    expect(mockButtonPress).toHaveBeenCalledTimes(1);
  });
});

const renderScreen = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQrScanPushEngagementScreen />,
    PN_ROUTES.QR_SCAN_PUSH_ENGAGEMENT,
    {},
    createStore(appReducer, globalState as any)
  );
};

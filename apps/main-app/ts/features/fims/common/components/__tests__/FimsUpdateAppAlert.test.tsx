import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FimsUpdateAppAlert } from "../FimsUpdateAppAlert";
import { FIMS_ROUTES } from "../../navigation";
import * as urlUtils from "../../../../../utils/url";
import * as otherHooks from "../../../../../hooks/useStartSupportRequest";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";

const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    goBack: mockGoBack,
    setOptions: mockSetOptions
  })
}));

describe("FimsUpdateAppAlert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockAccessibilityInfo();
  });
  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should call 'openAppStoreUrl' with no parameters when the primary action is pressed", () => {
    const mockOpenAppStoreUrl = jest
      .spyOn(urlUtils, "openAppStoreUrl")
      .mockImplementation(_fn => new Promise<void>(resolve => resolve()));

    const component = renderComponent();

    const primaryAction = component.getByTestId("primary-update-app");
    expect(primaryAction).toBeDefined();

    fireEvent(primaryAction, "onPress");

    expect(mockOpenAppStoreUrl.mock.calls.length).toBe(1);
    expect(mockOpenAppStoreUrl.mock.calls[0].length).toBe(0);
  });
  it("should call 'navigation.goBack()' when the primary action is pressed", () => {
    const component = renderComponent();

    const primaryAction = component.getByTestId("secondary-update-app");
    expect(primaryAction).toBeDefined();

    fireEvent(primaryAction, "onPress");

    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(1);
  });
  it("should set the navigation header to include the support request feature", () => {
    const mockStartSupportRequest = jest.fn();
    const useStartSupportRequestSpy = jest
      .spyOn(otherHooks, "useStartSupportRequest")
      .mockImplementation(_ => mockStartSupportRequest);

    renderComponent();

    // Combined checks below assert the presence of inner 'useOnlySupportRequestHeader' hook

    // Check `useStartSupportRequest`
    expect(useStartSupportRequestSpy.mock.calls.length).toBe(1);
    expect(useStartSupportRequestSpy.mock.calls[0].length).toBe(1);
    expect(useStartSupportRequestSpy.mock.calls[0][0]).toEqual({});

    // Check navigation.setOptions with parameters
    expect(mockSetOptions.mock.calls.length).toBe(1);
    expect(mockSetOptions.mock.calls[0].length).toBe(1);

    const setOptionsInput = mockSetOptions.mock.calls[0][0];
    const headerFunction = setOptionsInput.header;
    expect(headerFunction).toBeDefined();
    expect(typeof headerFunction).toBe("function");

    const headerSecondLevelComponent = headerFunction();
    expect(headerSecondLevelComponent).toBeDefined();
    expect(headerSecondLevelComponent.props).toBeDefined();
    expect(headerSecondLevelComponent.props.title).toBe("");
    expect(headerSecondLevelComponent.props.type).toBe("singleAction");
    const firstActionData = headerSecondLevelComponent.props.firstAction;
    expect(firstActionData).toBeDefined();
    expect(firstActionData.icon).toBe("help");
    expect(firstActionData.accessibilityLabel).toBe(
      I18n.t("global.accessibility.contextualHelp.open.label")
    );

    const headerFirstAction = firstActionData.onPress;
    expect(headerFirstAction).toBeDefined();
    expect(typeof headerFirstAction).toBe("function");
    expect(headerFirstAction).toBe(mockStartSupportRequest);

    // Check header first action onPress effect
    headerFirstAction();

    expect(mockStartSupportRequest.mock.calls.length).toBe(1);
    expect(mockStartSupportRequest.mock.calls[0].length).toBe(0);
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    () => <FimsUpdateAppAlert />,
    FIMS_ROUTES.MAIN,
    {},
    store
  );
};

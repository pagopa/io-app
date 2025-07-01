import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";
import { UpdateAppAlert } from "../UpdateAppAlert";
import * as urlUtils from "../../utils/url";
import * as otherHooks from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";

const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
jest.mock("../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    goBack: mockGoBack,
    setOptions: mockSetOptions
  })
}));

jest.mock("../../i18n", () => ({
  __esModule: true,
  default: { t: (key: string) => key },
  t: (key: string) => key
}));

describe("UpdateAppAlert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should call 'openAppStoreUrl' with no parameters when the primary action is pressed", () => {
    const mockOpenAppStoreUrl = jest
      .spyOn(urlUtils, "openAppStoreUrl")
      .mockImplementation(() => new Promise<void>(resolve => resolve()));

    const component = renderComponent();
    const primaryAction = component.getByTestId("primary-update-app");
    expect(primaryAction).toBeDefined();
    fireEvent(primaryAction, "onPress");
    expect(mockOpenAppStoreUrl).toHaveBeenCalledTimes(1);
    expect(mockOpenAppStoreUrl.mock.calls[0].length).toBe(0);
  });

  it("should call 'navigation.goBack()' when the secondary action is pressed", () => {
    const component = renderComponent();
    const secondaryAction = component.getByTestId("secondary-update-app");
    expect(secondaryAction).toBeDefined();
    fireEvent(secondaryAction, "onPress");
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });

  it("should set the navigation header to include the support request feature", () => {
    const mockStartSupportRequest = jest.fn();
    const useStartSupportRequestSpy = jest
      .spyOn(otherHooks, "useStartSupportRequest")
      .mockImplementation((_params: any) => mockStartSupportRequest);

    renderComponent();

    // Check useStartSupportRequest
    expect(useStartSupportRequestSpy).toHaveBeenCalledTimes(1);
    expect(useStartSupportRequestSpy.mock.calls[0][0]).toEqual({});

    // Check navigation.setOptions with parameters
    expect(mockSetOptions).toHaveBeenCalledTimes(1);
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
    expect(mockStartSupportRequest).toHaveBeenCalledTimes(1);
    expect(mockStartSupportRequest.mock.calls[0].length).toBe(0);
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <UpdateAppAlert />, // must be a function for navigation context
    "ANY_ROUTE", // route name is not used in this test
    {},
    store
  );
};

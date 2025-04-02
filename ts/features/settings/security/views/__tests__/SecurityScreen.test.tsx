import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { ActionType } from "typesafe-actions";
import SecurityScreen from "../SecurityScreen";
import I18n from "../../../../../i18n";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import { identificationRequest } from "../../../../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../../../../config";
import * as fimsHistorySelectors from "../../../../fims/history/store/selectors";
import { FIMS_ROUTES } from "../../../../fims/common/navigation";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: mockNavigate,
    setOptions: jest.fn()
  })
}));

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("Test SecurityScreen", () => {
  jest.useFakeTimers();
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockAccessibilityInfo(false);
  });
  it("should be not null", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
  });
  it("should render H1 component with title and H4 component with subtitle", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
    expect(
      // With the new navbar we have two titles.
      // The second one is the larger one.
      // The first one is the smaller one that is shown when scrolling.
      component.queryAllByText(I18n.t("profile.security.title"))[1]
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("profile.security.subtitle"))
    ).not.toBeNull();
  });
  it("should render ListItemNav reset unlock code with the right title and subtitle", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
    expect(component.queryByTestId("reset-unlock-code")).not.toBeNull();
    expect(
      // With the new navbar we have two titles.
      // The second one is the larger one.
      // The first one is the smaller one that is shown when scrolling.
      component.queryAllByText(I18n.t("profile.security.title"))[1]
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("profile.security.subtitle"))
    ).not.toBeNull();
  });
  it("when press ListItemNav reset unlock code, should dispatch 'identificationRequest' with proper parameters", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
    const listItemNav = component.getByTestId("reset-unlock-code");
    expect(listItemNav).not.toBeNull();

    fireEvent.press(listItemNav);

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0].length).toBe(1);
    const dispatchedAction = mockDispatch.mock.calls[0][0] as ActionType<
      typeof identificationRequest
    >;

    expect(dispatchedAction.type).toBe(identificationRequest().type);
    expect(dispatchedAction.payload.canResetPin).toBe(true);
    expect(dispatchedAction.payload.isValidatingTask).toBe(true);
    expect(dispatchedAction.payload.identificationGenericData).toBeUndefined();
    expect(dispatchedAction.payload.identificationCancelData).toBeUndefined();
    expect(dispatchedAction.payload.identificationSuccessData).toBeDefined();
    expect(
      dispatchedAction.payload.identificationSuccessData?.onSuccess
    ).toBeDefined();
    expect(dispatchedAction.payload.shufflePad).toBe(shufflePinPadOnPayment);
  });
  it("should match snapshot when 'fimsIsHistoryEnabledSelector' returns 'true'", () => {
    jest
      .spyOn(fimsHistorySelectors, "fimsIsHistoryEnabledSelector")
      .mockImplementation(_ => true);
    const { component } = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should have the FIMS history entry when 'fimsIsHistoryEnabledSelector' returns 'true' and the press event on it should navigate to the related screen", () => {
    jest
      .spyOn(fimsHistorySelectors, "fimsIsHistoryEnabledSelector")
      .mockImplementation(_ => true);
    const { component } = renderComponent();
    const fimsListItem = component.getByTestId("fims-history");
    expect(fimsListItem).toBeDefined();

    fireEvent.press(fimsListItem);
    expect(mockNavigate.mock.calls.length).toBe(1);
    expect(mockNavigate.mock.calls[0].length).toBe(2);
    expect(mockNavigate.mock.calls[0][0]).toBe(FIMS_ROUTES.MAIN);
    expect(mockNavigate.mock.calls[0][1]).toEqual({
      screen: FIMS_ROUTES.HISTORY
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      SecurityScreen,
      ROUTES.PROFILE_SECURITY,
      {},
      store
    ),
    store
  };
};

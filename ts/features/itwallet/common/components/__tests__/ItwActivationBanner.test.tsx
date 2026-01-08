import { fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../navigation/routes";
import * as selectors from "../../store/selectors";
import { ItwActivationBanner } from "../ItwActivationBanner";

jest.spyOn(Alert, "alert");

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate
    })
  };
});

describe("ItwActivationBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match the snapshtot when visible", () => {
    jest
      .spyOn(selectors, "itwShouldRenderActivationBannerSelector")
      .mockReturnValue(true);

    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshtot when not visible", () => {
    jest
      .spyOn(selectors, "itwShouldRenderActivationBannerSelector")
      .mockReturnValue(false);

    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("should navigate to onboarding when action button is pressed", () => {
    jest
      .spyOn(selectors, "itwShouldRenderActivationBannerSelector")
      .mockReturnValue(true);

    const { getByTestId } = renderComponent();
    const actionButton = getByTestId("itwEngagementBannerActionButtonTestID");

    fireEvent.press(actionButton);

    expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  });

  /*
  TODO SIW-3564 implement banner dismissal logic
  it("should display confirmation alert when close button is pressed", () => {
    jest
      .spyOn(selectors, "itwShouldRenderActivationBannerSelector")
      .mockReturnValue(true);

    const { getByTestId } = renderComponent();
    const closeButton = getByTestId("itwEngagementBannerCloseButtonTestID");

    fireEvent.press(closeButton);

    expect(Alert.alert).toHaveBeenCalled();
  });
  */
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwActivationBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};

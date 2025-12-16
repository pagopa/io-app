import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { LoginExpirationBanner } from "../LoginExpirationBanner";
import * as analytics from "../../analytics";
import * as urlUtils from "../../../../../utils/url";
import * as hooks from "../../../../../store/hooks";
import * as selectors from "../../../common/store/selectors";
import * as tracked from "../../../../../utils/analytics";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";

describe("LoginExpirationBanner", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest.spyOn(hooks, "useIOSelector").mockImplementation(selector => {
      if (selector === selectors.formattedExpirationDateSelector) {
        return "15/05/2025";
      }
      return undefined;
    });

    jest
      .spyOn(analytics, "trackLoginExpirationBannerPrompt")
      .mockImplementation(jest.fn());

    jest
      .spyOn(analytics, "trackLoginExpirationBannerClosure")
      .mockImplementation(jest.fn());

    jest
      .spyOn(tracked, "trackHelpCenterCtaTapped")
      .mockImplementation(jest.fn());

    jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation((_, onError) => onError?.());
  });

  it("should render correctly", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("loginExpirationBanner")).toBeTruthy();
  });

  it("should track prompt on mount", () => {
    renderComponent();
    expect(analytics.trackLoginExpirationBannerPrompt).toHaveBeenCalled();
  });

  it("should handle close action", () => {
    const { getByLabelText } = renderComponent();
    fireEvent.press(getByLabelText(I18n.t("global.buttons.close")));
    expect(mockDispatch).toHaveBeenCalled();
    expect(analytics.trackLoginExpirationBannerClosure).toHaveBeenCalled();
  });

  it("should handle onPress and show error if openWebUrl fails", () => {
    const { getByText } = renderComponent();
    fireEvent.press(
      getByText(
        I18n.t("loginFeatures.loginPreferences.expirationBanner.action.label")
      )
    );
    expect(tracked.trackHelpCenterCtaTapped).toHaveBeenCalled();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const handleOnCloseMock = jest.fn();
  return renderScreenWithNavigationStoreContext(
    () => <LoginExpirationBanner handleOnClose={handleOnCloseMock} />,
    "DUMMY",
    {},
    store
  );
};

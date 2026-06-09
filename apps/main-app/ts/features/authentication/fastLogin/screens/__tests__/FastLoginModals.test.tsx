import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import FastLoginModals from "../FastLoginModals";
import * as hooks from "../../../../../store/hooks";
import { TokenRefreshState } from "../../store/reducers/tokenRefreshReducer";
import * as actions from "../../store/actions/tokenRefreshActions";
import * as commonActions from "../../../common/store/actions";
import * as refreshTokenLoadingScreen from "../../screens/RefreshTokenLoadingScreen";

const dispatchMock = jest.fn();

const renderComponent = (props: {
  tokenRefreshing: TokenRefreshState;
  isFastLoginUserInteractionNeeded: boolean;
  lifecycleValid?: boolean;
  offlineEnabled?: boolean;
}) => {
  jest.spyOn(hooks, "useIODispatch").mockReturnValue(dispatchMock);
  jest.spyOn(hooks, "useIOSelector").mockImplementation(selector => {
    if (selector.name === "itwOfflineAccessAvailableSelector") {
      return props.lifecycleValid ?? false;
    }
    return false;
  });

  return render(
    // @ts-expect-error this is a module-level function, not a component
    FastLoginModals(
      props.tokenRefreshing,
      props.isFastLoginUserInteractionNeeded
    )
  );
};

describe("FastLoginModals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders AskUserInteractionScreen for no-pin-error", () => {
    const { getByText } = renderComponent({
      tokenRefreshing: { kind: "no-pin-error" },
      isFastLoginUserInteractionNeeded: false
    });

    expect(
      getByText(I18n.t("fastLogin.userInteraction.sessionExpired.noPin.title"))
    ).toBeTruthy();
  });

  it("dispatches actions on no-pin-error primaryAction", () => {
    const { getByText } = renderComponent({
      tokenRefreshing: { kind: "no-pin-error" },
      isFastLoginUserInteractionNeeded: false
    });

    fireEvent.press(
      getByText(
        I18n.t(
          "fastLogin.userInteraction.sessionExpired.noPin.submitButtonTitle"
        )
      )
    );

    expect(dispatchMock).toHaveBeenCalledWith(actions.clearTokenRefreshError());
    expect(dispatchMock).toHaveBeenCalledWith(
      commonActions.logoutRequest({ withApiCall: false })
    );
  });

  it("dispatches setOfflineAccessReason and returns undefined for transient-error with offline enabled", () => {
    jest.spyOn(hooks, "useIOSelector").mockImplementation(selector => {
      if (selector.name === "itwOfflineAccessAvailableSelector") {
        return true;
      }
      return false;
    });

    const result = FastLoginModals({ kind: "transient-error" }, false);

    expect(result).toBeUndefined();
  });

  it("renders AskUserInteractionScreen for transient-error without offline", () => {
    const { getByText } = renderComponent({
      tokenRefreshing: { kind: "transient-error" },
      isFastLoginUserInteractionNeeded: false,
      lifecycleValid: false,
      offlineEnabled: false
    });

    expect(
      getByText(
        I18n.t("fastLogin.userInteraction.sessionExpired.transientError.title")
      )
    ).toBeTruthy();
  });

  it("renders RefreshTokenLoadingScreen for in-progress", () => {
    const { UNSAFE_queryByType } = renderComponent({
      tokenRefreshing: { kind: "in-progress" },
      isFastLoginUserInteractionNeeded: false
    });

    expect(UNSAFE_queryByType(refreshTokenLoadingScreen.default)).toBeTruthy();
  });

  it("renders AskUserInteractionScreen when user interaction is needed", () => {
    const { getByText } = renderComponent({
      tokenRefreshing: { kind: "idle" },
      isFastLoginUserInteractionNeeded: true
    });

    expect(
      getByText(
        I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.title"
        )
      )
    ).toBeTruthy();
  });

  it("dispatches askUserToRefreshSessionToken.success on user interaction press", () => {
    const { getByText } = renderComponent({
      tokenRefreshing: { kind: "idle" },
      isFastLoginUserInteractionNeeded: true
    });

    fireEvent.press(
      getByText(
        I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.submitButtonTitle"
        )
      )
    );

    expect(dispatchMock).toHaveBeenCalledWith(
      actions.askUserToRefreshSessionToken.success("yes")
    );
  });

  it("returns undefined when nothing to render", () => {
    const result = FastLoginModals({ kind: "idle" }, false);
    expect(result).toBeUndefined();
  });
});

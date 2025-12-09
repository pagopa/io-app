import I18n from "i18next";
import { TokenRefreshState } from "../store/reducers/tokenRefreshReducer";
import { logoutRequest } from "../../common/store/actions";
import {
  askUserToRefreshSessionToken,
  clearTokenRefreshError
} from "../store/actions/tokenRefreshActions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setOfflineAccessReason } from "../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import { itwOfflineAccessAvailableSelector } from "../../../itwallet/common/store/selectors";
import RefreshTokenLoadingScreen from "./RefreshTokenLoadingScreen";
import AskUserInteractionScreen from "./AskUserInteractionScreen";

const FastLoginModals = (
  tokenRefreshing: TokenRefreshState,
  isFastLoginUserInteractionNeeded: boolean
) => {
  const dispatch = useIODispatch();
  const isOfflineAccessAvailable = useIOSelector(
    itwOfflineAccessAvailableSelector
  );

  if (tokenRefreshing.kind === "no-pin-error") {
    return (
      <AskUserInteractionScreen
        pictogram="time"
        title={I18n.t("fastLogin.userInteraction.sessionExpired.noPin.title")}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.noPin.subtitle"
        )}
        action={{
          label: I18n.t(
            "fastLogin.userInteraction.sessionExpired.noPin.submitButtonTitle"
          ),
          accessibilityLabel: I18n.t(
            "fastLogin.userInteraction.sessionExpired.noPin.submitButtonTitle"
          ),
          onPress: () => {
            dispatch(clearTokenRefreshError());
            dispatch(logoutRequest({ withApiCall: false }));
          }
        }}
      />
    );
  }

  if (tokenRefreshing.kind === "transient-error") {
    if (isOfflineAccessAvailable) {
      dispatch(setOfflineAccessReason(OfflineAccessReasonEnum.SESSION_REFRESH));
      return undefined;
    }
    return (
      <AskUserInteractionScreen
        enableAnimatedPictogram
        pictogram="umbrella"
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.transientError.title"
        )}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.transientError.subtitle"
        )}
      />
    );
  }

  if (tokenRefreshing.kind === "in-progress") {
    return <RefreshTokenLoadingScreen />;
  }

  if (isFastLoginUserInteractionNeeded) {
    return (
      <AskUserInteractionScreen
        pictogram="time"
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.title"
        )}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.subtitle"
        )}
        action={{
          label: I18n.t(
            "fastLogin.userInteraction.sessionExpired.continueNavigation.submitButtonTitle"
          ),
          accessibilityLabel: I18n.t(
            "fastLogin.userInteraction.sessionExpired.continueNavigation.submitButtonTitle"
          ),
          onPress: () => {
            dispatch(askUserToRefreshSessionToken.success("yes"));
          }
        }}
      />
    );
  }

  return undefined;
};

export default FastLoginModals;

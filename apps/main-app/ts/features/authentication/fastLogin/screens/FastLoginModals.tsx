import I18n from "i18next";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setOfflineAccessReason } from "../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import { itwOfflineAccessAvailableSelector } from "../../../itwallet/common/store/selectors";
import { logoutRequest } from "../../common/store/actions";
import {
  askUserToRefreshSessionToken,
  clearTokenRefreshError
} from "../store/actions/tokenRefreshActions";
import { TokenRefreshState } from "../store/reducers/tokenRefreshReducer";
import AskUserInteractionScreen from "./AskUserInteractionScreen";
import RefreshTokenLoadingScreen from "./RefreshTokenLoadingScreen";

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
        pictogram="time"
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.noPin.subtitle"
        )}
        title={I18n.t("fastLogin.userInteraction.sessionExpired.noPin.title")}
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
        pictogram="umbrella"
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.transientError.subtitle"
        )}
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.transientError.title"
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
        pictogram="time"
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.subtitle"
        )}
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.title"
        )}
      />
    );
  }

  return undefined;
};

export default FastLoginModals;

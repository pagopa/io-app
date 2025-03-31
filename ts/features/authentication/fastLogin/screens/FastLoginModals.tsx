import I18n from "../../../../i18n";
import { TokenRefreshState } from "../store/reducers/tokenRefreshReducer";
import { logoutRequest } from "../../common/store/actions";
import {
  askUserToRefreshSessionToken,
  clearTokenRefreshError
} from "../store/actions/tokenRefreshActions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsOperationalOrValid } from "../../../itwallet/lifecycle/store/selectors";
import { isItwOfflineAccessEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { setOfflineAccessReason } from "../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import RefreshTokenLoadingScreen from "./RefreshTokenLoadingScreen";
import AskUserInteractionScreen from "./AskUserInteractionScreen";

const FastLoginModals = (
  tokenRefreshing: TokenRefreshState,
  isFastLoginUserInteractionNeeded: boolean
) => {
  const dispatch = useIODispatch();
  const selectItwLifecycleIsOperationalOrValid = useIOSelector(
    itwLifecycleIsOperationalOrValid
  );
  const isOfflineAccessEnabled = useIOSelector(
    isItwOfflineAccessEnabledSelector
  );

  if (tokenRefreshing.kind === "no-pin-error") {
    return (
      <AskUserInteractionScreen
        pictogramName="time"
        title={I18n.t("fastLogin.userInteraction.sessionExpired.noPin.title")}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.noPin.subtitle"
        )}
        primaryAction={{
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
    if (selectItwLifecycleIsOperationalOrValid && isOfflineAccessEnabled) {
      dispatch(setOfflineAccessReason(OfflineAccessReasonEnum.SESSION_REFRESH));
      return undefined;
    }
    return (
      <AskUserInteractionScreen
        pictogramName="umbrella"
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
        pictogramName="time"
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.title"
        )}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.subtitle"
        )}
        primaryAction={{
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

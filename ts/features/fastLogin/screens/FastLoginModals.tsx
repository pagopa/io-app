import I18n from "i18n-js";
import React from "react";
import { useDispatch } from "react-redux";
import { TokenRefreshState } from "../store/reducers/tokenRefreshReducer";
import { logoutRequest } from "../../../store/actions/authentication";
import {
  askUserToRefreshSessionToken,
  clearTokenRefreshError
} from "../store/actions/tokenRefreshActions";
import AskUserInteractionScreen from "./AskUserInteractionScreen";
import RefreshTokenLoadingScreen from "./RefreshTokenLoadingScreen";

const FastLoginModals = (
  tokenRefreshing: TokenRefreshState,
  isFastLoginUserInteractionNeeded: boolean
) => {
  const dispatch = useDispatch();

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
            dispatch(logoutRequest());
          }
        }}
      />
    );
  }

  if (tokenRefreshing.kind === "transient-error") {
    return (
      <AskUserInteractionScreen
        pictogramName="umbrellaNew"
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

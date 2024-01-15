import I18n from "i18n-js";
import React from "react";
import { useDispatch } from "react-redux";
import { TokenRefreshState } from "../store/reducers/tokenRefreshReducer";
import { logoutRequest } from "../../../store/actions/authentication";
import { openWebUrl } from "../../../utils/url";
import {
  askUserToRefreshSessionToken,
  clearTokenRefreshError
} from "../store/actions/tokenRefreshActions";
import AskUserInteractionScreen from "./AskUserInterarctionScreen";
import RefreshTokenLoadingScreen from "./RefreshTokenLoadingScreen";

const FastLoginModals = (
  tokenRefreshing: TokenRefreshState,
  isFastLoginUserInteractionNeeded: boolean
) => {
  const dispatch = useDispatch();

  if (tokenRefreshing.kind === "no-pin-error") {
    return (
      <AskUserInteractionScreen
        pictogramName="timeout"
        title={I18n.t("fastLogin.userInteraction.sessionExpired.noPin.title")}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.noPin.subtitle"
        )}
        onSubmit={() => {
          dispatch(clearTokenRefreshError());
          dispatch(logoutRequest());
        }}
        buttonStylesProps={{
          submitButtonStyle: {
            type: "solid",
            title: I18n.t(
              "fastLogin.userInteraction.sessionExpired.noPin.submitButtonTitle"
            )
          }
        }}
      />
    );
  }

  if (tokenRefreshing.kind === "transient-error") {
    return (
      <AskUserInteractionScreen
        pictogramName="umbrella"
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.transientError.title"
        )}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.transientError.subtitle"
        )}
        onSubmit={() => {
          // FIXME: update this URL once available
          // https://pagopa.atlassian.net/browse/IOPID-393
          openWebUrl("https://io.italia.it/faq");
        }}
        buttonStylesProps={{
          submitButtonStyle: {
            type: "solid",
            title: I18n.t(
              "fastLogin.userInteraction.sessionExpired.transientError.submitButtonTitle"
            )
          }
        }}
      />
    );
  }

  if (tokenRefreshing.kind === "in-progress") {
    return <RefreshTokenLoadingScreen />;
  }

  if (isFastLoginUserInteractionNeeded) {
    return (
      <AskUserInteractionScreen
        pictogramName="timeout"
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.title"
        )}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.subtitle"
        )}
        onSubmit={() => {
          dispatch(askUserToRefreshSessionToken.success("yes"));
        }}
        buttonStylesProps={{
          submitButtonStyle: {
            type: "solid",
            title: I18n.t(
              "fastLogin.userInteraction.sessionExpired.continueNavigation.submitButtonTitle"
            )
          }
        }}
      />
    );
  }

  return undefined;
};

export default FastLoginModals;

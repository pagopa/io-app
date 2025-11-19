import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import I18n from "i18next";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import _isEqual from "lodash/isEqual";
import { IdpData } from "../../../../../../definitions/content/IdpData";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { LoadingIndicator } from "../../../../../components/ui/LoadingIndicator";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
// import { mixpanelTrack } from "../../../../../mixpanel";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { idpContextualHelpDataFromIdSelector } from "../../../../../store/reducers/content";
import { SessionToken } from "../../../../../types/SessionToken";
// import { trackSpidLoginError } from "../../../../../utils/analytics";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import { getUrlBasepath } from "../../../../../utils/url";
import { useLollipopLoginSource } from "../../../../lollipop/hooks/useLollipopLoginSource";
import { AUTH_ERRORS } from "../../../common/components/AuthErrorComponent";
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import {
  // loginFailure,
  idpLoginUrlChanged
} from "../../../common/store/actions";
import {
  getIdpLoginUri,
  getIntentFallbackUrl,
  onLoginUriChanged
} from "../../../common/utils/login";
import { originSchemasWhiteList } from "../../../common/utils/originSchemasWhiteList";
import { usePosteIDApp2AppEducational } from "../../../login/idp/hooks/usePosteIDApp2AppEducational";
import { getSpidErrorCodeDescription } from "../../../login/idp/utils/spidErrorCode";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess
} from "../../store/actions";
import {
  idpSelectedActiveSessionLoginSelector,
  activeSessionUserLoggedSelector,
  remoteApiLoginUrlPrefixSelector
} from "../../store/selectors";
import { ErrorType as SpidLoginErrorType } from "../../../login/idp/store/types";
import useActiveSessionLoginNavigation from "../../utils/useActiveSessionLoginNavigation";
import { ACS_PATH } from "../../shared/utils";

// TODO: consider changing the loader to unify it and use the same one for both CIE and SPID

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  webViewWrapper: { flex: 1 }
});

// The MP events related to this page have been commented on,
// pending their correct integration into the flow.
// Task: https://pagopa.atlassian.net/browse/IOPID-3343

/**
 * A screen that allows the user to login with an IDP.
 * The IDP page is opened in a WebView
 */
const ActiveSessionIdpLoginScreen = () => {
  const dispatch = useIODispatch();
  // The choice was made to use `replace` instead of `navigate` because the former unmounts the current screen,
  // ensuring the re-execution of the `useLollipopLoginSource` hook.
  const { replace } = useIONavigation();

  const selectedIdp = useIOSelector(idpSelectedActiveSessionLoginSelector);
  const selectedIdpTextData = useIOSelector(
    idpContextualHelpDataFromIdSelector(selectedIdp?.id),
    _isEqual
  );

  const activeSessionUserLogged = useIOSelector(
    activeSessionUserLoggedSelector
  );

  const assistanceToolConfig = useIOSelector(
    assistanceToolConfigSelector,
    _isEqual
  );

  const [isFinishingLogin, setIsFinishingLogin] = useState(false);
  const [requestState, setRequestState] = useState<
    pot.Pot<true, SpidLoginErrorType>
  >(pot.none);
  const [errorCodeOrMessage, setErrorCodeOrMessage] = useState<
    string | undefined
  >(undefined);
  const [loginTrace, setLoginTrace] = useState<string | undefined>(undefined);
  const posteIdBottomsheet = usePosteIDApp2AppEducational({
    selectedIdp,
    requestState
  });

  const handleOnLollipopCheckFailure = useCallback(() => {
    setRequestState(pot.noneError(SpidLoginErrorType.LOGIN_ERROR));
  }, [setRequestState]);

  const idpId = selectedIdp?.id;

  const remoteApiLoginUrlPrefix = useIOSelector(
    remoteApiLoginUrlPrefixSelector
  );

  const acsUrl = `${remoteApiLoginUrlPrefix}${ACS_PATH}`;

  const loginUri = idpId
    ? getIdpLoginUri(idpId, 2, remoteApiLoginUrlPrefix)
    : undefined;
  const { shouldBlockUrlNavigationWhileCheckingLollipop, webviewSource } =
    useLollipopLoginSource(handleOnLollipopCheckFailure, loginUri);

  const { forceLogoutAndNavigateToLanding } = useActiveSessionLoginNavigation();

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const idp = useMemo(() => {
    const selected = selectedIdp;

    return selected?.id as keyof IdpData;
  }, [selectedIdp]);

  const handleLoadingError = useCallback(
    (error: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
      // trackSpidLoginError(selectedIdp?.id, error);
      const webViewHttpError = error as WebViewHttpErrorEvent;
      if (webViewHttpError.nativeEvent.statusCode) {
        const { statusCode, url } = webViewHttpError.nativeEvent;
        if (url.includes(acsUrl)) {
          forceLogoutAndNavigateToLanding();
        } else if (statusCode !== 403) {
          setRequestState(pot.noneError(SpidLoginErrorType.LOADING_ERROR));
        }
      } else {
        setRequestState(pot.noneError(SpidLoginErrorType.LOADING_ERROR));
      }
    },
    [acsUrl, forceLogoutAndNavigateToLanding]
  );

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      setIsFinishingLogin(true);
      if (code !== AUTH_ERRORS.ERROR_1004) {
        dispatch(activeSessionLoginFailure());
      }
      // else {
      //   dispatch(
      //     loginFailure({
      //       error: new Error(
      //         `login failure with code ${code || message || "n/a"}`
      //       ),
      //       idp
      //     })
      //   );
      // }

      const logText = pipe(
        O.fromNullable(code || message),
        O.fold(
          () => "login failed with no error code or message available",
          _ => {
            if (code) {
              return `login failed with code (${code}) : ${getSpidErrorCodeDescription(
                code
              )}`;
            }
            return `login failed with message ${message}`;
          }
        )
      );

      handleSendAssistanceLog(choosenTool, logText);
      setRequestState(pot.noneError(SpidLoginErrorType.LOGIN_ERROR));
      setErrorCodeOrMessage(code || message);
    },
    [dispatch, choosenTool, setRequestState]
  );

  const handleLoginSuccess = useCallback(
    (token: SessionToken) => {
      setIsFinishingLogin(true);
      handleSendAssistanceLog(choosenTool, `login success`);
      if (idp) {
        dispatch(activeSessionLoginSuccess(token));
      }
    },
    [choosenTool, dispatch, idp]
  );

  const handleNavigationStateChange = useCallback(
    (event: WebViewNavigation) => {
      const url = event.url;

      if (url) {
        const urlBasePath = getUrlBasepath(url);
        if (urlBasePath !== loginTrace) {
          dispatch(idpLoginUrlChanged({ url: urlBasePath }));
          setLoginTrace(urlBasePath);
        }
      }

      const isAssertion = pipe(
        url,
        O.fromNullable,
        O.fold(
          () => false,
          s => s.indexOf(ACS_PATH) > -1
        )
      );
      setRequestState(
        event.loading || isAssertion ? pot.noneLoading : pot.some(true)
      );
    },
    [dispatch, loginTrace, setRequestState]
  );

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;
      // if an intent is coming from the IDP login form, extract the fallbackUrl and use it in Linking.openURL
      const idpIntent = getIntentFallbackUrl(url);
      if (O.isSome(idpIntent)) {
        // void mixpanelTrack("SPID_LOGIN_INTENT", {
        //   idp: selectedIdp
        // });
        void Linking.openURL(idpIntent.value);
        return false;
      }

      if (shouldBlockUrlNavigationWhileCheckingLollipop(url)) {
        return false;
      }

      const isLoginUrlWithToken = onLoginUriChanged(
        handleLoginFailure,
        handleLoginSuccess,
        idp
      )(event);
      // URL can be loaded if it's not the login URL containing the session token - this avoids
      // making a (useless) GET request with the session in the URL
      return !isLoginUrlWithToken;
    },
    [
      shouldBlockUrlNavigationWhileCheckingLollipop,
      handleLoginFailure,
      handleLoginSuccess,
      idp
      // selectedIdp
    ]
  );

  const renderMask = () => {
    // in order to prevent graphic glitches when navigating
    // to the error screen the spinner is shown also when the login has failed
    if (
      pot.isLoading(requestState) ||
      pot.isError(requestState) ||
      isFinishingLogin
    ) {
      return (
        <View style={styles.refreshIndicatorContainer}>
          <LoadingIndicator testID="loading-indicator" />
        </View>
      );
    }
    // loading complete, no mask needed
    return null;
  };

  const navigateToAuthErrorScreen = useCallback(() => {
    // The choice was made to use `replace` instead of `navigate` because the former unmounts the current screen,
    // ensuring the re-execution of the `useLollipopLoginSource` hook.
    replace(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage,
        authMethod: "SPID",
        authLevel: "L2"
      }
    });
  }, [errorCodeOrMessage, replace]);

  useEffect(() => {
    if (pot.isError(requestState)) {
      navigateToAuthErrorScreen();
    }
  }, [navigateToAuthErrorScreen, requestState]);

  const contextualHelp = useMemo(() => {
    if (O.isNone(selectedIdpTextData)) {
      return {
        title: I18n.t("authentication.idp_login.contextualHelpTitle"),
        body: I18n.t("authentication.idp_login.contextualHelpContent")
      };
    }
    return emptyContextualHelp;
  }, [selectedIdpTextData]);

  const hasError = pot.isError(requestState);

  /* Wrapped with `useMemo` to prevent unnecessary executions of `useLayoutEffect`
  inside`useHeaderSecondLevel`, it seemed to cause bugs when opening certain Idps. */
  const headerProps: HeaderSecondLevelHookProps = useMemo(
    () =>
      !activeSessionUserLogged
        ? {
            title: `${I18n.t("authentication.idp_login.headerTitle")} - ${
              selectedIdp?.name
            }`,
            supportRequest: true,
            contextualHelp,
            faqCategories: ["authentication_SPID"]
          }
        : { title: "", canGoBack: false },
    [activeSessionUserLogged, selectedIdp?.name, contextualHelp]
  );

  useHeaderSecondLevel(headerProps);

  // Wrapped with `useMemo` to prevent unnecessary re-renders, it seemed to cause bugs when attempting to open certain Idps.
  const content = useMemo(
    () => (
      <WebView
        testID="webview-active-session-idp-login-screen"
        cacheEnabled={false}
        androidCameraAccessDisabled
        androidMicrophoneAccessDisabled
        javaScriptEnabled
        textZoom={100}
        originWhitelist={originSchemasWhiteList}
        source={webviewSource}
        onError={handleLoadingError}
        onHttpError={handleLoadingError}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoading}
      />
    ),
    [
      handleLoadingError,
      handleNavigationStateChange,
      handleShouldStartLoading,
      webviewSource
    ]
  );

  if (activeSessionUserLogged) {
    return <IdpSuccessfulAuthentication />;
  }

  // This condition will be true if the navigation occurs
  // before the redux state is updated successfully OR if
  // the hook that retrieves the LolliPOP public key has
  // failed because there was no login-url to use OR when
  // the LolliPOP checks are running
  if (!selectedIdp || !webviewSource) {
    // This internal if handles the case where the initial
    // login-url was not available and so the hook that
    // retrieves the public key cannot produce a valid output
    if (pot.isError(requestState)) {
      return null;
    }
    return <LoadingSpinnerOverlay isLoading={true} />;
  }

  return (
    <View style={styles.webViewWrapper}>
      {!hasError && content}
      {renderMask()}
      {posteIdBottomsheet}
    </View>
  );
};

// Exported with `memo` to protect from unnecessary re-renders triggered by `navigation.setOptions` from `useHeaderSecondLevel`
export default memo(ActiveSessionIdpLoginScreen);

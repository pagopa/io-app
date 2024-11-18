import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";

import _isEqual from "lodash/isEqual";
import { IdpData } from "../../../definitions/content/IdpData";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator";
import { apiUrlPrefix } from "../../config";
import { useLollipopLoginSource } from "../../features/lollipop/hooks/useLollipopLoginSource";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../hooks/useHeaderSecondLevel";
import I18n from "../../i18n";
import { mixpanelTrack } from "../../mixpanel";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import {
  idpLoginUrlChanged,
  loginFailure,
  loginSuccess
} from "../../store/actions/authentication";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  loggedInAuthSelector,
  loggedOutWithIdpAuthSelector,
  selectedIdentityProviderSelector
} from "../../store/reducers/authentication";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import { idpContextualHelpDataFromIdSelector } from "../../store/reducers/content";
import { SessionToken } from "../../types/SessionToken";
import { trackSpidLoginError } from "../../utils/analytics";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import {
  getIdpLoginUri,
  getIntentFallbackUrl,
  onLoginUriChanged
} from "../../utils/login";
import { getSpidErrorCodeDescription } from "../../utils/spidErrorCode";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../utils/supportAssistance";
import { getUrlBasepath } from "../../utils/url";
import { originSchemasWhiteList } from "./originSchemasWhiteList";

enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

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

/**
 * A screen that allows the user to login with an IDP.
 * The IDP page is opened in a WebView
 */
const IdpLoginScreen = () => {
  const dispatch = useIODispatch();
  const { navigate } = useIONavigation();
  const selectedIdp = useIOSelector(selectedIdentityProviderSelector, _isEqual);
  const selectedIdpTextData = useIOSelector(
    idpContextualHelpDataFromIdSelector(selectedIdp?.id),
    _isEqual
  );
  const loggedOutWithIdpAuth = useIOSelector(
    loggedOutWithIdpAuthSelector,
    _isEqual
  );
  const loggedInAuth = useIOSelector(loggedInAuthSelector, _isEqual);
  const assistanceToolConfig = useIOSelector(
    assistanceToolConfigSelector,
    _isEqual
  );

  const [requestState, setRequestState] = useState<pot.Pot<true, ErrorType>>(
    pot.noneLoading
  );
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
  const [loginTrace, setLoginTrace] = useState<string | undefined>(undefined);

  const handleOnLollipopCheckFailure = useCallback(() => {
    setRequestState(pot.noneError(ErrorType.LOGIN_ERROR));
  }, []);

  const idpId = loggedOutWithIdpAuth?.idp.id;
  const loginUri = idpId ? getIdpLoginUri(idpId, 2) : undefined;
  const {
    retryLollipopLogin,
    shouldBlockUrlNavigationWhileCheckingLollipop,
    webviewSource
  } = useLollipopLoginSource(handleOnLollipopCheckFailure, loginUri);

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const idp = useMemo(
    () => loggedOutWithIdpAuth?.idp.id as keyof IdpData,
    [loggedOutWithIdpAuth]
  );

  const handleLoadingError = useCallback(
    (error: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
      trackSpidLoginError(loggedOutWithIdpAuth?.idp.id, error);
      const webViewHttpError = error as WebViewHttpErrorEvent;
      if (webViewHttpError.nativeEvent.statusCode) {
        const { statusCode, url } = webViewHttpError.nativeEvent;
        if (url.includes(apiUrlPrefix) || statusCode !== 403) {
          setRequestState(pot.noneError(ErrorType.LOADING_ERROR));
        }
      } else {
        setRequestState(pot.noneError(ErrorType.LOADING_ERROR));
      }
    },
    [loggedOutWithIdpAuth?.idp.id]
  );

  const handleLoginFailure = useCallback(
    (code?: string) => {
      dispatch(
        loginFailure({
          error: new Error(`login failure with code ${code || "n/a"}`),
          idp
        })
      );
      const logText = pipe(
        code,
        O.fromNullable,
        O.fold(
          () => "login failed with no error code available",
          ec =>
            `login failed with code (${ec}) : ${getSpidErrorCodeDescription(
              ec
            )}`
        )
      );

      handleSendAssistanceLog(choosenTool, logText);
      setRequestState(pot.noneError(ErrorType.LOGIN_ERROR));
      setErrorCode(code);
    },
    [dispatch, choosenTool, idp]
  );

  const handleLoginSuccess = useCallback(
    (token: SessionToken) => {
      handleSendAssistanceLog(choosenTool, `login success`);
      if (idp) {
        dispatch(loginSuccess({ token, idp }));
      }
    },
    [choosenTool, dispatch, idp]
  );

  const onRetryButtonPressed = useCallback((): void => {
    setRequestState(pot.noneLoading);
    retryLollipopLogin();
  }, [retryLollipopLogin]);

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
          s => s.indexOf("/assertionConsumerService") > -1
        )
      );
      setRequestState(
        event.loading || isAssertion ? pot.noneLoading : pot.some(true)
      );
    },
    [dispatch, loginTrace]
  );

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;
      // if an intent is coming from the IDP login form, extract the fallbackUrl and use it in Linking.openURL
      const idpIntent = getIntentFallbackUrl(url);
      if (O.isSome(idpIntent)) {
        void mixpanelTrack("SPID_LOGIN_INTENT", {
          idp: loggedOutWithIdpAuth?.idp
        });
        void Linking.openURL(idpIntent.value);
        return false;
      }

      if (shouldBlockUrlNavigationWhileCheckingLollipop(url)) {
        return false;
      }

      const isLoginUrlWithToken = onLoginUriChanged(
        handleLoginFailure,
        handleLoginSuccess
      )(event);
      // URL can be loaded if it's not the login URL containing the session token - this avoids
      // making a (useless) GET request with the session in the URL
      return !isLoginUrlWithToken;
    },
    [
      handleLoginFailure,
      handleLoginSuccess,
      loggedOutWithIdpAuth?.idp,
      shouldBlockUrlNavigationWhileCheckingLollipop
    ]
  );

  const renderMask = () => {
    // in order to prevent graphic glitches when navigating
    // to the error screen the spinner is shown also when the login has failed
    if (pot.isLoading(requestState) || pot.isError(requestState)) {
      return (
        <View style={styles.refreshIndicatorContainer}>
          <LoadingIndicator />
        </View>
      );
    }
    // loading complete, no mask needed
    return null;
  };

  const navigateToAuthErrorScreen = useCallback(() => {
    navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCode,
        authMethod: "SPID",
        authLevel: "L2",
        onRetry: onRetryButtonPressed
      }
    });
  }, [errorCode, onRetryButtonPressed, navigate]);

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
      !loggedInAuth
        ? {
            title: `${I18n.t("authentication.idp_login.headerTitle")} - ${
              loggedOutWithIdpAuth?.idp.name
            }`,
            supportRequest: true,
            contextualHelp,
            faqCategories: ["authentication_SPID"]
          }
        : { title: "", canGoBack: false },
    [contextualHelp, loggedInAuth, loggedOutWithIdpAuth?.idp.name]
  );

  useHeaderSecondLevel(headerProps);

  // Wrapped with `useMemo` to prevent unnecessary re-renders, it seemed to cause bugs when attempting to open certain Idps.
  const content = useMemo(
    () => (
      <WebView
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

  if (loggedInAuth) {
    return <IdpSuccessfulAuthentication />;
  }

  // This condition will be true if the navigation occurs
  // before the redux state is updated successfully OR if
  // the hook that retrieves the LolliPOP public key has
  // failed because there was no login-url to use OR when
  // the LolliPOP checks are running
  if (!loggedOutWithIdpAuth || !webviewSource) {
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
    </View>
  );
};

// Exported with `memo` to protect from unnecessary re-renders triggered by `navigation.setOptions` from `useHeaderSecondLevel`
export default memo(IdpLoginScreen);

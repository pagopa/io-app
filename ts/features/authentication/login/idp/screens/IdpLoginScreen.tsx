import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import _isEqual from "lodash/isEqual";
import I18n from "i18next";
import { IdpData } from "../../../../../../definitions/content/IdpData";
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { LoadingIndicator } from "../../../../../components/ui/LoadingIndicator";
import { apiUrlPrefix } from "../../../../../config";
import { useLollipopLoginSource } from "../../../../lollipop/hooks/useLollipopLoginSource";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import {
  idpLoginUrlChanged,
  loginFailure,
  loginSuccess
} from "../../../common/store/actions";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  loggedInAuthSelector,
  loggedOutWithIdpAuthSelector,
  selectedIdentityProviderSelector
} from "../../../common/store/selectors";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { idpContextualHelpDataFromIdSelector } from "../../../../../store/reducers/content";
import { trackSpidLoginError } from "../../../../../utils/analytics";
import { emptyContextualHelp } from "../../../../../utils/contextualHelp";
import {
  getIdpLoginUri,
  getIntentFallbackUrl,
  onLoginUriChanged
} from "../../../common/utils/login";
import { getSpidErrorCodeDescription } from "../utils/spidErrorCode";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import { getUrlBasepath } from "../../../../../utils/url";
import { standardLoginRequestInfoSelector } from "../store/selectors";
import { setStandardLoginRequestState } from "../store/actions";
import { ErrorType as SpidLoginErrorType } from "../store/types";
import { originSchemasWhiteList } from "../../../common/utils/originSchemasWhiteList";
import { usePosteIDApp2AppEducational } from "../hooks/usePosteIDApp2AppEducational";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { remoteApiLoginUrlPrefixSelector } from "../../../activeSessionLogin/store/selectors";
import { trackSpidLoginIntent } from "../../../activeSessionLogin/screens/analytics";

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
  // The choice was made to use `replace` instead of `navigate` because the former unmounts the current screen,
  // ensuring the re-execution of the `useLollipopLoginSource` hook.
  const { replace } = useIONavigation();
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

  const { requestState } = useIOSelector(standardLoginRequestInfoSelector);
  const [errorCodeOrMessage, setErrorCodeOrMessage] = useState<
    string | undefined
  >(undefined);
  const [loginTrace, setLoginTrace] = useState<string | undefined>(undefined);
  const posteIdBottomsheet = usePosteIDApp2AppEducational({
    selectedIdp,
    requestState
  });

  const setRequestState = useCallback(
    (req: pot.Pot<true, SpidLoginErrorType>) => {
      dispatch(setStandardLoginRequestState(req));
    },
    [dispatch]
  );

  const handleOnLollipopCheckFailure = useCallback(() => {
    setRequestState(pot.noneError(SpidLoginErrorType.LOGIN_ERROR));
  }, [setRequestState]);

  const idpId = loggedOutWithIdpAuth?.idp.id;
  const remoteApiLoginUrlPrefix = useIOSelector(
    remoteApiLoginUrlPrefixSelector
  );
  const loginUri = idpId
    ? getIdpLoginUri(idpId, 2, remoteApiLoginUrlPrefix)
    : undefined;
  const { shouldBlockUrlNavigationWhileCheckingLollipop, webviewSource } =
    useLollipopLoginSource(handleOnLollipopCheckFailure, loginUri);

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
          setRequestState(pot.noneError(SpidLoginErrorType.LOADING_ERROR));
        }
      } else {
        setRequestState(pot.noneError(SpidLoginErrorType.LOADING_ERROR));
      }
    },
    [loggedOutWithIdpAuth?.idp.id, setRequestState]
  );

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      dispatch(
        loginFailure({
          error: new Error(
            `login failure with code ${code || message || "n/a"}`
          ),
          idp
        })
      );
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
    [dispatch, choosenTool, idp, setRequestState]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      handleSendAssistanceLog(choosenTool, `login success`);
      if (idp) {
        dispatch(loginSuccess({ token, idp }));
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
          s => s.indexOf("/assertionConsumerService") > -1
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
        void trackSpidLoginIntent(loggedOutWithIdpAuth?.idp);
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
      handleLoginFailure,
      handleLoginSuccess,
      loggedOutWithIdpAuth?.idp,
      idp,
      shouldBlockUrlNavigationWhileCheckingLollipop
    ]
  );

  const renderMask = () => {
    // in order to prevent graphic glitches when navigating
    // to the error screen the spinner is shown also when the login has failed
    if (pot.isLoading(requestState) || pot.isError(requestState)) {
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
        testID="webview-idp-login-screen"
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
      {posteIdBottomsheet}
    </View>
  );
};

// Exported with `memo` to protect from unnecessary re-renders triggered by `navigation.setOptions` from `useHeaderSecondLevel`
export default memo(IdpLoginScreen);

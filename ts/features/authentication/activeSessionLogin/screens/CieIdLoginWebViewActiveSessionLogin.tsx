import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { URL } from "react-native-url-polyfill";
import { openCieIdApp } from "@pagopa/io-react-native-cieid";
import { Linking, Platform, StyleSheet } from "react-native";
import WebView, { type WebViewNavigation } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import _isEqual from "lodash/isEqual";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useLollipopLoginSource } from "../../../lollipop/hooks/useLollipopLoginSource";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { SessionToken } from "../../../../types/SessionToken";
import { IdpSuccessfulAuthentication } from "../../common/components/IdpSuccessfulAuthentication";
import { onLoginUriChanged } from "../../common/utils/login";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../hooks/useHeaderSecondLevel";

import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { remoteApiLoginUrlPrefixSelector } from "../../loginPreferences/store/selectors";
import { getCieIDLoginUri, isAuthenticationUrl } from "../../login/cie/utils";
import {
  IO_LOGIN_CIE_URL_SCHEME,
  CIE_ID_ERROR,
  CIE_ID_ERROR_MESSAGE,
  IO_LOGIN_CIE_SOURCE_APP
} from "../../login/cie/utils/cie";
import { activeSessionUserLoggedSelector } from "../store/selectors";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  setFinishedActiveSessionLoginFlow
} from "../store/actions";
import { AUTH_ERRORS } from "../../common/components/AuthErrorComponent";
import ROUTES from "../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { AuthenticationParamsList } from "../../common/navigation/params/AuthenticationParamsList";
import { originSchemasWhiteList } from "../../common/utils/originSchemasWhiteList";
import {
  CieIdLoginProps,
  WHITELISTED_DOMAINS,
  defaultUserAgent,
  LoadingOverlay
} from "../../login/cie/components/CieIdLoginWebView";

const CieIdLoginWebViewActiveSessionLogin = ({
  spidLevel,
  isUat
}: CieIdLoginProps) => {
  const navigation = useIONavigation();
  const webView = useRef<WebView>(null);
  const dispatch = useIODispatch();
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null);
  const activeSessionUserLogged = useIOSelector(
    activeSessionUserLoggedSelector
  );
  const apiLoginUrlPrefix = useIOSelector(remoteApiLoginUrlPrefixSelector);
  const loginUri = getCieIDLoginUri(spidLevel, isUat, apiLoginUrlPrefix);
  const [isLoadingWebView, setIsLoadingWebView] = useState(true);
  const navigateToCieIdAuthenticationError = useCallback(() => {
    navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_ERROR
    });
  }, [navigation]);

  const navigateToCieIdAuthUrlError = useCallback(
    (url: string) => {
      navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL,
        params: { url }
      });
    },
    [navigation]
  );

  const navigateToMessagesHomeScreen = useCallback(() => {
    dispatch(setFinishedActiveSessionLoginFlow());
    navigation.navigate(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  }, [dispatch, navigation]);

  const checkIfUrlIsWhitelisted = useCallback(
    (url: string) => {
      // Checks if the URL starts with one of the valid URLs

      try {
        const { origin } = new URL(url);
        const isDomainValid = WHITELISTED_DOMAINS.includes(origin);

        if (isDomainValid) {
          // Set the URL as valid
          setAuthenticatedUrl(url);
        } else {
          // Redirects the user to the error screen
          navigateToCieIdAuthUrlError(url);
        }
      } catch (error) {
        // Redirects the user to the error screen
        navigateToCieIdAuthUrlError(url);
      }
    },
    [navigateToCieIdAuthUrlError]
  );

  const { shouldBlockUrlNavigationWhileCheckingLollipop, webviewSource } =
    useLollipopLoginSource(navigateToCieIdAuthenticationError, loginUri);

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      if (code !== AUTH_ERRORS.NOT_SAME_CF) {
        dispatch(activeSessionLoginFailure());
      }
      // // Tracking is temporarily disabled until the final list of events is confirmed.
      // Classic login events are kept in case the same ones are reused, with only a
      // profile/super property added for active session login.
      // trackLoginSpidError(code || message, {
      //   idp: IdpCIE_ID.id,
      //   ...(message ? { "error message": message } : {})
      // });
      // dispatch(
      //   loginFailure({
      //     error: new Error(
      //       `login failure with code ${code || message || "n/a"}`
      //     ),
      //     idp: "cieid"
      //   })
      // );
      // Since we are replacing the screen it's not necessary to trigger the lollipop key regeneration,
      // because on `navigation.replace` this screen will be unmounted and a further navigation to this screen
      // will mount it again and the `useLollipopLoginSource` hook will be re-executed.
      navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
        params: {
          errorCodeOrMessage: code || message,
          authMethod: "CIE_ID",
          authLevel: "L2",
          params: { spidLevel, isUat }
        }
      });
    },
    [dispatch, navigation, spidLevel, isUat]
  );

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    // https://reactnative.dev/docs/linking#open-links-and-deep-links-universal-links
    const urlListenerSubscription = Linking.addEventListener(
      "url",
      ({ url }) => {
        // if the url is of this format: iologincie:https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2
        // extract the part after iologincie: and dispatch the action to handle the login
        if (url.startsWith(IO_LOGIN_CIE_URL_SCHEME)) {
          const [, continueUrl] = url.split(IO_LOGIN_CIE_URL_SCHEME);

          if (continueUrl) {
            // https://idserver.servizicie.interno.gov.it/cieiderror?cieid_error_message=Operazione_annullata_dall'utente
            // We check if the continueUrl is an error
            if (continueUrl.indexOf(CIE_ID_ERROR) !== -1) {
              if (continueUrl.indexOf(CIE_ID_ERROR_MESSAGE) !== -1) {
                // And we extract the error message and show it in an alert
                const [, errorMessage] =
                  continueUrl.split(CIE_ID_ERROR_MESSAGE);
                handleLoginFailure(errorMessage);
              } else {
                handleLoginFailure();
              }
            } else {
              checkIfUrlIsWhitelisted(continueUrl);
            }
          }
        }
      }
    );

    return () => urlListenerSubscription.remove();
  }, [handleLoginFailure, checkIfUrlIsWhitelisted]);

  const handleLoginSuccess = useCallback(
    (token: SessionToken) => {
      dispatch(activeSessionLoginSuccess(token));
    },
    [dispatch]
  );

  const handleOpenCieIdApp = useCallback(
    (url: string) => {
      if (Platform.OS === "ios") {
        // TODO: error tracking opening url https://pagopa.atlassian.net/browse/IOPID-2079
        Linking.openURL(
          `CIEID://${url}&sourceApp=${IO_LOGIN_CIE_SOURCE_APP}`
        ).catch(handleLoginFailure);
      } else {
        openCieIdApp(
          url,
          result => {
            if (result.id === "ERROR") {
              handleLoginFailure(result.code);
            } else {
              checkIfUrlIsWhitelisted(result.url);
            }
          },
          isUat
        );
      }
    },
    [handleLoginFailure, isUat, checkIfUrlIsWhitelisted]
  );

  const handleOnShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    const url = event.url;

    if (shouldBlockUrlNavigationWhileCheckingLollipop(url)) {
      return false;
    }

    if (isAuthenticationUrl(url)) {
      handleOpenCieIdApp(url);

      return false;
    }

    const isLoginUrlWithToken = onLoginUriChanged(
      handleLoginFailure,
      handleLoginSuccess,
      "cieid"
    )(event);
    // URL can be loaded if it's not the login URL containing the session token - this avoids
    // making a (useless) GET request with the session in the URL
    return !isLoginUrlWithToken;
  };

  const handleLoadingError = useCallback(
    (error: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
      // TODO: error tracking  https://pagopa.atlassian.net/browse/IOPID-2079
      const webViewHttpError = error as WebViewHttpErrorEvent;
      if (webViewHttpError.nativeEvent.statusCode) {
        const { statusCode, url } = webViewHttpError.nativeEvent;
        if (url.includes(apiLoginUrlPrefix) || statusCode !== 403) {
          // TODO: manage this error
          navigateToCieIdAuthenticationError();
        }
      } else {
        // TODO: manage this error
        navigateToCieIdAuthenticationError();
      }
    },
    [apiLoginUrlPrefix, navigateToCieIdAuthenticationError]
  );

  const headerProps: HeaderSecondLevelHookProps = useMemo(() => {
    if (webviewSource && !isLoadingWebView) {
      return { title: "", goBack: navigateToMessagesHomeScreen }; // TODO: check if is only necessary the navigation.goBack()
    }
    return {
      title: "",
      canGoBack: false
    };
  }, [isLoadingWebView, navigateToMessagesHomeScreen, webviewSource]);

  useHeaderSecondLevel(headerProps);

  if (activeSessionUserLogged) {
    return <IdpSuccessfulAuthentication />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {(webviewSource || authenticatedUrl) && (
        <WebView
          testID="cie-id-webview"
          ref={webView}
          startInLoadingState={true}
          userAgent={defaultUserAgent}
          javaScriptEnabled={true}
          renderLoading={() => (
            <LoadingOverlay onCancel={navigateToCieIdAuthenticationError} />
          )}
          onLoadEnd={() => setIsLoadingWebView(false)}
          originWhitelist={originSchemasWhiteList}
          onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
          onHttpError={handleLoadingError}
          onError={handleLoadingError}
          source={authenticatedUrl ? { uri: authenticatedUrl } : webviewSource}
        />
      )}
      {!webviewSource && (
        <LoadingOverlay onCancel={navigateToCieIdAuthenticationError} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 16
  }
});

const CieIdActiveSessionLoginScreen = () => {
  const route =
    useRoute<
      RouteProp<
        AuthenticationParamsList,
        typeof AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
      >
    >();

  return <CieIdLoginWebViewActiveSessionLogin {...route.params} />;
};

export default CieIdActiveSessionLoginScreen;

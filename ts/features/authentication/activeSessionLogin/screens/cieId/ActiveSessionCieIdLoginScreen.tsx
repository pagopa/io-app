import { useCallback, useEffect, useRef, useState } from "react";
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
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useLollipopLoginSource } from "../../../../lollipop/hooks/useLollipopLoginSource";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { SessionToken } from "../../../../../types/SessionToken";
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import { onLoginUriChanged } from "../../../common/utils/login";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";

import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import {
  getCieIDLoginUri,
  isAuthenticationUrl
} from "../../../login/cie/utils";
import {
  IO_LOGIN_CIE_URL_SCHEME,
  CIE_ID_ERROR,
  CIE_ID_ERROR_MESSAGE,
  IO_LOGIN_CIE_SOURCE_APP
} from "../../../login/cie/utils/cie";
import {
  activeSessionUserLoggedSelector,
  remoteApiLoginUrlPrefixSelector
} from "../../store/selectors";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  setFinishedActiveSessionLoginFlow
} from "../../store/actions";
import { AUTH_ERRORS } from "../../../common/components/AuthErrorComponent";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { originSchemasWhiteList } from "../../../common/utils/originSchemasWhiteList";
import { LoadingOverlay } from "../../../login/cie/shared/LoadingSpinnerOverlay";
import {
  CieIdLoginProps,
  WHITELISTED_DOMAINS,
  defaultUserAgent
} from "../../../login/cie/shared/utils";
import useActiveSessionLoginNavigation from "../../utils/useActiveSessionLoginNavigation";
import { ACS_PATH } from "../../shared/utils";
import { trackLoginSpidError } from "../../../common/analytics/spidAnalytics";
import { IdpCIE_ID } from "../../../login/hooks/useNavigateToLoginMethod";
import { trackLoginFailure } from "../../../common/analytics";

const ActiveSessionCieIdLoginWebView = ({
  spidLevel,
  isUat
}: CieIdLoginProps) => {
  const navigation = useIONavigation();
  const webView = useRef<WebView>(null);
  const dispatch = useIODispatch();
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null);
  const isLoginUrlWithTokenRef = useRef<boolean>(false);
  const activeSessionUserLogged = useIOSelector(
    activeSessionUserLoggedSelector
  );
  const apiLoginUrlPrefix = useIOSelector(remoteApiLoginUrlPrefixSelector);
  const acsUrl = `${apiLoginUrlPrefix}${ACS_PATH}`;
  const loginUri = getCieIDLoginUri(spidLevel, isUat, apiLoginUrlPrefix);
  const [isLoadingWebView, setIsLoadingWebView] = useState(true);
  const { forceLogoutAndNavigateToLanding } = useActiveSessionLoginNavigation();
  // Forces logout due to a corrupted session,
  // then navigates the user back to the Landing screen.

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
      if (code !== AUTH_ERRORS.ERROR_1004) {
        dispatch(activeSessionLoginFailure());
      }
      trackLoginFailure({
        reason: new Error(
          `login failure with code ${code || message || "n/a"}`
        ),
        idp: "cieid",
        flow: "reauth"
      });
      trackLoginSpidError(code || message, {
        idp: IdpCIE_ID.id,
        ...(message ? { "error message": message } : {}),
        flow: "reauth"
      });
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

    // eslint-disable-next-line functional/immutable-data
    isLoginUrlWithTokenRef.current = onLoginUriChanged(
      handleLoginFailure,
      handleLoginSuccess,
      "cieid",
      "reauth"
    )(event);
    // URL can be loaded if it's not the login URL containing the session token - this avoids
    // making a (useless) GET request with the session in the URL
    return !isLoginUrlWithTokenRef.current;
  };

  const handleLoadingError = useCallback(
    (error: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
      // TODO: error tracking  https://pagopa.atlassian.net/browse/IOPID-2079
      const webViewHttpError = error as WebViewHttpErrorEvent;
      if (webViewHttpError.nativeEvent.statusCode) {
        const { statusCode, url } = webViewHttpError.nativeEvent;
        if (url.includes(acsUrl)) {
          forceLogoutAndNavigateToLanding();
        } else if (statusCode !== 403) {
          navigateToCieIdAuthenticationError();
        }
      } else {
        navigateToCieIdAuthenticationError();
      }
    },
    [
      acsUrl,
      forceLogoutAndNavigateToLanding,
      navigateToCieIdAuthenticationError
    ]
  );

  useHeaderSecondLevel({
    title: "",
    canGoBack: webviewSource && !isLoadingWebView,
    goBack: () => {
      dispatch(setFinishedActiveSessionLoginFlow());
      navigation.popToTop();
    }
  });

  if (activeSessionUserLogged) {
    return <IdpSuccessfulAuthentication />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {(webviewSource || authenticatedUrl) &&
        !isLoginUrlWithTokenRef.current && (
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
            source={
              authenticatedUrl ? { uri: authenticatedUrl } : webviewSource
            }
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

const ActiveSessionCieIdLoginScreen = () => {
  const route =
    useRoute<
      RouteProp<
        AuthenticationParamsList,
        typeof AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
      >
    >();

  return <ActiveSessionCieIdLoginWebView {...route.params} />;
};

export default ActiveSessionCieIdLoginScreen;

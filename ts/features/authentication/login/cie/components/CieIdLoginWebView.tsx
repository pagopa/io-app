import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { URL } from "react-native-url-polyfill";
import { openCieIdApp } from "@pagopa/io-react-native-cieid";
import { Linking, Platform, StyleSheet, View } from "react-native";
import WebView, { type WebViewNavigation } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import _isEqual from "lodash/isEqual";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { getCieIDLoginUri, isAuthenticationUrl, SpidLevel } from "../utils";
import { useLollipopLoginSource } from "../../../../lollipop/hooks/useLollipopLoginSource";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import { SessionToken } from "../../../../../types/SessionToken";
import ROUTES from "../../../../../navigation/routes";
import { loggedInAuthSelector } from "../../../common/store/selectors";
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import { isDevEnv } from "../../../../../utils/environment";
import { onLoginUriChanged } from "../../../../../utils/login";
import { apiUrlPrefix } from "../../../../../config";
import { trackLoginSpidError } from "../../../common/analytics/spidAnalytics";
import { IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
import {
  CIE_ID_ERROR,
  CIE_ID_ERROR_MESSAGE,
  IO_LOGIN_CIE_SOURCE_APP,
  IO_LOGIN_CIE_URL_SCHEME
} from "../../../../../utils/cie";
import { useOnboardingAbortAlert } from "../../../../../utils/hooks/useOnboardingAbortAlert";

export type WebViewLoginNavigationProps = {
  spidLevel: SpidLevel;
  isUat: boolean;
};

const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined
});

const originSchemasWhiteList = [
  "https://*",
  "iologin://*",
  ...(isDevEnv ? ["http://*"] : [])
];

const WHITELISTED_DOMAINS = [
  "https://idserver.servizicie.interno.gov.it",
  "https://oidc.idserver.servizicie.interno.gov.it",
  "https://mtls.oidc.idserver.servizicie.interno.gov.it",
  "https://mtls.idserver.servizicie.interno.gov.it",
  "https://ios.idserver.servizicie.interno.gov.it",
  "https://ios.oidc.idserver.servizicie.interno.gov.it"
];

export type CieIdLoginProps = {
  spidLevel: SpidLevel;
  isUat: boolean;
};

const LoadingOverlay = ({ onCancel }: { onCancel: () => void }) => (
  <View style={styles.loader}>
    <LoadingSpinnerOverlay isLoading onCancel={onCancel} />
  </View>
);

const CieIdLoginWebView = ({ spidLevel, isUat }: CieIdLoginProps) => {
  const navigation = useIONavigation();
  const webView = useRef<WebView>(null);
  const dispatch = useIODispatch();
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null);
  const loggedInAuth = useIOSelector(loggedInAuthSelector, _isEqual);
  const loginUri = getCieIDLoginUri(spidLevel, isUat);
  const [isLoadingWebView, setIsLoadingWebView] = useState(false);

  const navigateToCieIdAuthenticationError = useCallback(() => {
    navigation.replace(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_ERROR
    });
  }, [navigation]);

  const navigateToCieIdAuthUrlError = useCallback(
    (url: string) => {
      navigation.replace(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_CIE_ID_INCORRECT_URL,
        params: { url }
      });
    },
    [navigation]
  );

  const navigateToLandingScreen = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_LANDING
    });
  }, [navigation]);

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
      // TODO: move the error tracking in the `AuthErrorScreen`
      trackLoginSpidError(code || message, {
        idp: IdpCIE_ID.id,
        ...(message ? { "error message": message } : {})
      });
      dispatch(
        loginFailure({
          error: new Error(
            `login failure with code ${code || message || "n/a"}`
          ),
          idp: "cieid"
        })
      );
      // Since we are replacing the screen it's not necessary to trigger the lollipop key regeneration,
      // because on `navigation.replace` this screen will be unmounted and a further navigation to this screen
      // will mount it again and the `useLollipopLoginSource` hook will be re-executed.
      navigation.replace(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTH_ERROR_SCREEN,
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
      dispatch(loginSuccess({ token, idp: "cieid" }));
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
        if (url.includes(apiUrlPrefix) || statusCode !== 403) {
          navigateToCieIdAuthenticationError();
        }
      } else {
        navigateToCieIdAuthenticationError();
      }
    },
    [navigateToCieIdAuthenticationError]
  );

  const { showAlert } = useOnboardingAbortAlert();

  const headerProps: HeaderSecondLevelHookProps = useMemo(() => {
    if (webviewSource && !isLoadingWebView) {
      return { title: "", goBack: () => showAlert(navigateToLandingScreen) };
    }
    return {
      title: "",
      canGoBack: false
    };
  }, [isLoadingWebView, navigateToLandingScreen, showAlert, webviewSource]);

  useHeaderSecondLevel(headerProps);

  if (loggedInAuth) {
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
          renderLoading={() => {
            setIsLoadingWebView(true);
            return (
              <LoadingOverlay onCancel={navigateToCieIdAuthenticationError} />
            );
          }}
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
  },
  loader: { position: "absolute", width: "100%", height: "100%" }
});

export default CieIdLoginWebView;

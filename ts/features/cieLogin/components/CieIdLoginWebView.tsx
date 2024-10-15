import React, { useCallback, useEffect, useRef, useState } from "react";
import { openCieIdApp } from "@pagopa/io-react-native-cieid";
import { Alert, Linking, Platform, StyleSheet } from "react-native";
import WebView, { type WebViewNavigation } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import _isEqual from "lodash/isEqual";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { getCieIDLoginUri, SpidLevel } from "../utils";
import { useLollipopLoginSource } from "../../lollipop/hooks/useLollipopLoginSource";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { loginSuccess } from "../../../store/actions/authentication";
import { SessionToken } from "../../../types/SessionToken";
import ROUTES from "../../../navigation/routes";
import { loggedInAuthSelector } from "../../../store/reducers/authentication";
import { IdpSuccessfulAuthentication } from "../../../components/IdpSuccessfulAuthentication";

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

const originSchemasWhiteList = ["https://*", "iologin://*"];
const IO_LOGIN_CIE_URL_SCHEME = "iologincie:";
const LOGIN_SUCCESS_PAGE = "profile.html?token=";
const CIE_ID_ERROR = "cieiderror";
const CIE_ID_ERROR_MESSAGE = "cieid_error_message=";

export type CieIdLoginProps = {
  spidLevel: SpidLevel;
  isUat: boolean;
};

const CieIdLoginWebView = ({ spidLevel, isUat }: CieIdLoginProps) => {
  const navigation = useIONavigation();
  const webView = useRef<WebView>(null);
  const dispatch = useIODispatch();
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null);
  const loggedInAuth = useIOSelector(loggedInAuthSelector, _isEqual);
  const loginUri = getCieIDLoginUri(spidLevel, isUat);

  const navigateToCieIdAuthenticationError = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_ERROR
    });
  }, [navigation]);

  const { shouldBlockUrlNavigationWhileCheckingLollipop, webviewSource } =
    useLollipopLoginSource(navigateToCieIdAuthenticationError, loginUri);

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
                // TODO: remove this after https://pagopa.atlassian.net/browse/IOPID-2322
                Alert.alert("Login error ❌", errorMessage);
              } else {
                // TODO: remove this after https://pagopa.atlassian.net/browse/IOPID-2322
                Alert.alert("Login error ❌", "error");
              }
            } else {
              setAuthenticatedUrl(continueUrl);
            }
          }
        }
      }
    );

    return () => urlListenerSubscription.remove();
  }, []);

  const handleOnShouldStartLoadWithRequest = (
    event: WebViewNavigation
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ): boolean => {
    const url = event.url;

    if (shouldBlockUrlNavigationWhileCheckingLollipop(url)) {
      return false;
    }

    if (url.indexOf(LOGIN_SUCCESS_PAGE) !== -1) {
      const [, token] = url.split(LOGIN_SUCCESS_PAGE);
      if (token) {
        // show success alert with dismiss button navigatin back
        dispatch(loginSuccess({ token: token as SessionToken, idp: "cie" }));
      }
      return false;
    }

    if (
      url.indexOf("livello1") >= 0 || // SpidL1
      (url.indexOf("livello2") >= 0 && url.indexOf("livello2mobile") === -1) || // SpidL2
      url.indexOf("nextUrl") >= 0 || // SpidL3 iOS
      url.indexOf("openApp") >= 0 // SpidL3 Android
    ) {
      if (Platform.OS === "ios") {
        const urlForCieId = `CIEID://${url}&sourceApp=iologincie`;
        Linking.openURL(urlForCieId).catch(navigateToCieIdAuthenticationError);
      } else {
        openCieIdApp(
          url,
          result => {
            if (result.id === "ERROR") {
              // TODO: remove this after https://pagopa.atlassian.net/browse/IOPID-2322
              navigateToCieIdAuthenticationError();
            } else {
              setAuthenticatedUrl(result.url);
            }
          },
          isUat
        );
      }
      return false;
    }
    return true;
  };

  // TODO: remove this after https://pagopa.atlassian.net/browse/IOPID-2322
  if (!webviewSource) {
    return (
      <LoadingSpinnerOverlay
        isLoading
        onCancel={navigateToCieIdAuthenticationError}
      />
    );
  }

  if (loggedInAuth) {
    return <IdpSuccessfulAuthentication />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webView}
        startInLoadingState={true}
        userAgent={defaultUserAgent}
        javaScriptEnabled={true}
        originWhitelist={originSchemasWhiteList}
        onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
        source={authenticatedUrl ? { uri: authenticatedUrl } : webviewSource}
      />
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

export default CieIdLoginWebView;

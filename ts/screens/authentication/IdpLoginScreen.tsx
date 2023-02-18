import { PublicKey } from "@pagopa/io-react-native-crypto";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBText, View } from "native-base";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Linking, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigation,
  WebViewSource
} from "react-native-webview/lib/WebViewTypes";
import { connect } from "react-redux";
import URLParse from "url-parse";
import brokenLinkImage from "../../../img/broken-link.png";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IdpCustomContextualHelpContent from "../../components/screens/IdpCustomContextualHelpContent";
import Markdown from "../../components/ui/Markdown";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import { useLollipopLoginSource } from "../../features/lollipop/hooks/useLollipopLoginSource";
import { publicKey } from "../../features/lollipop/types/LollipopLoginSource";
import { lollipopSamlVerify } from "../../features/lollipop/utils/login";
import { LollipopCheckStatus } from "../../features/lollipop/types/LollipopCheckStatus";
import I18n from "../../i18n";
import { mixpanelTrack } from "../../mixpanel";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import {
  idpLoginUrlChanged,
  loginFailure,
  loginSuccess
} from "../../store/actions/authentication";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedOutWithIdp,
  selectedIdentityProviderSelector
} from "../../store/reducers/authentication";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import { idpContextualHelpDataFromIdSelector } from "../../store/reducers/content";
import { GlobalState } from "../../store/reducers/types";
import { SessionToken } from "../../types/SessionToken";
import { getAppVersion } from "../../utils/appVersion";
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
import { apiUrlPrefix, lollipopLoginEnabled } from "../../config";
import { originSchemasWhiteList } from "./originSchemasWhiteList";

type NavigationProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_IDP_LOGIN"
>;

type Props = NavigationProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

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
  errorContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 10
  },
  errorBody: {
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center"
  },
  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  },
  cancelButtonStyle: {
    flex: 1,
    marginEnd: 10
  },
  flex2: {
    flex: 2
  },
  webViewWrapper: { flex: 1 }
});

/**
 * A screen that allows the user to login with an IDP.
 * The IDP page is opened in a WebView
 */
const IdpLoginScreen = (props: Props) => {
  const [requestState, setRequestState] = useState<pot.Pot<true, ErrorType>>(
    pot.noneLoading
  );
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
  const [loginTrace, setLoginTrace] = useState<string | undefined>(undefined);
  const [lollipopCheckStatus, setLollipopCheckStatus] =
    useState<LollipopCheckStatus>({ status: "none", url: O.none });

  const lollipopUserAgent = lollipopLoginEnabled
    ? `IO-App/${getAppVersion()}`
    : undefined;
  const [userAgent, setUserAgent] = useState<string | undefined>(
    lollipopUserAgent
  );

  const [webviewSource, setWebviewSource] = useState<WebViewSource | undefined>(
    undefined
  );

  const idpId = props.loggedOutWithIdpAuth?.idp.id;
  const loginUri = idpId ? getIdpLoginUri(idpId) : undefined;
  const loginSource = useLollipopLoginSource(loginUri);

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(props.assistanceToolConfig),
    [props.assistanceToolConfig]
  );

  const startLoginProcess = useCallback(() => {
    if (loginSource.kind === "ready") {
      setUserAgent(lollipopUserAgent);
      setWebviewSource(loginSource.value);
    }
  }, [loginSource, lollipopUserAgent]);

  useEffect(() => {
    startLoginProcess();
  }, [startLoginProcess]);

  const idp = useMemo(
    () => props.loggedOutWithIdpAuth?.idp.id ?? "n/a",
    [props.loggedOutWithIdpAuth]
  );

  const handleLoadingError = (error: WebViewErrorEvent): void => {
    const { code, description, domain } = error.nativeEvent;
    void mixpanelTrack("SPID_ERROR", {
      idp: props.loggedOutWithIdpAuth?.idp.id,
      code,
      description,
      domain
    });

    setRequestState(pot.noneError(ErrorType.LOADING_ERROR));
  };

  const handleLoginFailure = useCallback(
    (code?: string) => {
      props.dispatchLoginFailure(
        new Error(`login failure with code ${code || "n/a"}`),
        idp
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
    [choosenTool, idp, props]
  );

  const handleLoginSuccess = (token: SessionToken) => {
    handleSendAssistanceLog(choosenTool, `login success`);
    props.dispatchLoginSuccess(token, idp);
  };

  const onRetryButtonPressed = (): void => {
    setRequestState(pot.noneLoading);
    setLollipopCheckStatus({ status: "none", url: O.none });
    startLoginProcess();
  };

  const handleNavigationStateChange = useCallback(
    (event: WebViewNavigation) => {
      const url = event.url;

      if (url) {
        const urlBasePath = getUrlBasepath(url);
        if (urlBasePath !== loginTrace) {
          props.dispatchIdpLoginUrlChanged(urlBasePath);
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
    [loginTrace, props]
  );

  const handleShouldStartLoading = (event: WebViewNavigation): boolean => {
    const url = event.url;
    // if an intent is coming from the IDP login form, extract the fallbackUrl and use it in Linking.openURL
    const idpIntent = getIntentFallbackUrl(url);
    if (O.isSome(idpIntent)) {
      void mixpanelTrack("SPID_LOGIN_INTENT", {
        idp: props.loggedOutWithIdpAuth?.idp
      });
      void Linking.openURL(idpIntent.value);
      return false;
    }

    const parsedUrl = new URLParse(url, true);

    // We leave the custom user agent header only for the first call
    // to the backend API server, but we clear it for subsequent calls to
    // IdPs' webpages.
    // See: https://pagopa.atlassian.net/browse/IOAPPCIT-46
    const origin = parsedUrl.origin;
    if (origin === apiUrlPrefix) {
      setUserAgent(lollipopUserAgent);
    } else {
      setUserAgent(undefined);
    }

    const urlQuery = parsedUrl.query;
    const urlEncodedSamlRequest = urlQuery?.SAMLRequest;
    if (urlEncodedSamlRequest) {
      if (lollipopCheckStatus.status === "none") {
        // Make sure that we have a public key (since its retrieval
        // may have failed - in which case let the flow go through
        // the non-lollipop standard check process)
        const publicKeyOption = publicKey(loginSource);
        if (O.isSome(publicKeyOption)) {
          // Start Lollipop verification process
          setLollipopCheckStatus({
            status: "checking",
            url: O.some(url)
          });
          verifyLollipop(url, urlEncodedSamlRequest, publicKeyOption.value);
          // Prevent the WebView from loading the current URL (its
          // loading will be restored after LolliPOP verification
          // has succeded)
          return false;
        }
        // If code reaches this point, then either the public key
        // retrieval has failed or lollipop is not enabled. Let
        // the code flow follow the standard non-lollipop scenario
      } else if (lollipopCheckStatus.status === "checking") {
        // LolliPOP signature is being verified, prevent the WebView
        // from loading the current URL,
        return false;
      }

      // If code reaches this point, either there is no public key
      // or lollipop is not enabled or the LolliPOP signature has
      // been verified (in both cases, let the code flow). Code
      // flow shall never hit this method if LolliPOP signature
      // verification has failed, since an error is displayed and
      // the WebViewSource is left undefined
    }

    const isLoginUrlWithToken = onLoginUriChanged(
      handleLoginFailure,
      handleLoginSuccess
    )(event);
    // URL can be loaded if it's not the login URL containing the session token - this avoids
    // making a (useless) GET request with the session in the URL
    return !isLoginUrlWithToken;
  };

  const verifyLollipop = useCallback(
    (eventUrl: string, urlEncodedSamlRequest: string, publicKey: PublicKey) => {
      setWebviewSource(undefined);
      lollipopSamlVerify(
        urlEncodedSamlRequest,
        publicKey,
        () => {
          setLollipopCheckStatus({
            status: "trusted",
            url: O.some(eventUrl)
          });
          setWebviewSource({ uri: eventUrl });
        },
        () => {
          setLollipopCheckStatus({
            status: "untrusted",
            url: O.some(eventUrl)
          });
          setRequestState(pot.noneError(ErrorType.LOGIN_ERROR));
        }
      );
    },
    []
  );

  const renderMask = () => {
    if (pot.isLoading(requestState)) {
      return (
        <View style={styles.refreshIndicatorContainer}>
          <RefreshIndicator />
        </View>
      );
    } else if (pot.isError(requestState)) {
      const errorType = requestState.error;
      const errorTranslationKey = `authentication.errors.spid.error_${errorCode}`;

      return (
        <View style={styles.errorContainer}>
          <Image source={brokenLinkImage} resizeMode="contain" />
          <NBText style={styles.errorTitle} bold={true}>
            {I18n.t(
              errorType === ErrorType.LOADING_ERROR
                ? "authentication.errors.network.title"
                : "authentication.errors.login.title"
            )}
          </NBText>

          {errorType === ErrorType.LOGIN_ERROR && (
            <NBText style={styles.errorBody}>
              {I18n.t(errorTranslationKey, {
                defaultValue: I18n.t("authentication.errors.spid.unknown")
              })}
            </NBText>
          )}

          <View style={styles.errorButtonsContainer}>
            <ButtonDefaultOpacity
              onPress={() => props.navigation.goBack()}
              style={styles.cancelButtonStyle}
              block={true}
              light={true}
              bordered={true}
            >
              <NBText>{I18n.t("global.buttons.cancel")}</NBText>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              onPress={onRetryButtonPressed}
              style={styles.flex2}
              block={true}
              primary={true}
            >
              <NBText>{I18n.t("global.buttons.retry")}</NBText>
            </ButtonDefaultOpacity>
          </View>
        </View>
      );
    }
    // loading complete, no mask needed
    return null;
  };

  const contextualHelp = useMemo(() => {
    if (O.isNone(props.selectedIdpTextData)) {
      return {
        title: I18n.t("authentication.idp_login.contextualHelpTitle"),
        body: () => (
          <Markdown>
            {I18n.t("authentication.idp_login.contextualHelpContent")}
          </Markdown>
        )
      };
    }
    const idpTextData = props.selectedIdpTextData.value;
    return IdpCustomContextualHelpContent(idpTextData);
  }, [props.selectedIdpTextData]);

  const { loggedOutWithIdpAuth, loggedInAuth } = props;
  const hasError = pot.isError(requestState);

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
      return renderMask();
    }
    return <LoadingSpinnerOverlay isLoading={true} />;
  }

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={contextualHelp}
      faqCategories={["authentication_SPID"]}
      headerTitle={`${I18n.t("authentication.idp_login.headerTitle")} - ${
        loggedOutWithIdpAuth.idp.name
      }`}
    >
      <View style={styles.webViewWrapper}>
        {!hasError && (
          <WebView
            cacheEnabled={false}
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            textZoom={100}
            originWhitelist={originSchemasWhiteList}
            userAgent={userAgent}
            source={webviewSource}
            onError={handleLoadingError}
            javaScriptEnabled={true}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoading}
          />
        )}
        {renderMask()}
      </View>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const selectedIdp = selectedIdentityProviderSelector(state);

  const selectedIdpTextData = pipe(
    selectedIdp,
    O.fromNullable,
    O.chain(idp => idpContextualHelpDataFromIdSelector(idp.id)(state))
  );

  return {
    loggedOutWithIdpAuth: isLoggedOutWithIdp(state.authentication)
      ? state.authentication
      : undefined,
    loggedInAuth: isLoggedIn(state.authentication)
      ? state.authentication
      : undefined,
    selectedIdpTextData,
    assistanceToolConfig: assistanceToolConfigSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchIdpLoginUrlChanged: (url: string) =>
    dispatch(idpLoginUrlChanged({ url })),
  dispatchLoginSuccess: (token: SessionToken, idp: string) =>
    dispatch(loginSuccess({ token, idp })),
  dispatchLoginFailure: (error: Error, idp: string) =>
    dispatch(loginFailure({ error, idp }))
});

export default connect(mapStateToProps, mapDispatchToProps)(IdpLoginScreen);

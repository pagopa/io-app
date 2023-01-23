import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBButtonText } from "native-base";
import * as React from "react";
import { View, Image, Linking, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import { connect } from "react-redux";
import brokenLinkImage from "../../../img/broken-link.png";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";
import { H2 } from "../../components/core/typography/H2";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IdpCustomContextualHelpContent from "../../components/screens/IdpCustomContextualHelpContent";
import Markdown from "../../components/ui/Markdown";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
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

type State = {
  requestState: pot.Pot<true, ErrorType>;
  errorCode?: string;
  loginTrace?: string;
};

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
class IdpLoginScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      requestState: pot.noneLoading
    };
  }

  private choosenTool = assistanceToolRemoteConfig(
    this.props.assistanceToolConfig
  );

  get idp(): string {
    return this.props.loggedOutWithIdpAuth?.idp.id ?? "n/a";
  }

  private updateLoginTrace = (url: string): void => {
    this.setState({ loginTrace: url });
  };

  private handleLoadingError = (error: WebViewErrorEvent): void => {
    const { code, description, domain } = error.nativeEvent;
    void mixpanelTrack("SPID_ERROR", {
      idp: this.props.loggedOutWithIdpAuth?.idp.id,
      code,
      description,
      domain
    });
    this.setState({
      requestState: pot.noneError(ErrorType.LOADING_ERROR)
    });
  };

  private handleLoginFailure = (errorCode?: string) => {
    this.props.dispatchLoginFailure(
      new Error(`login failure with code ${errorCode || "n/a"}`),
      this.idp
    );
    const logText = pipe(
      errorCode,
      O.fromNullable,
      O.fold(
        () => "login failed with no error code available",
        ec =>
          `login failed with code (${ec}) : ${getSpidErrorCodeDescription(ec)}`
      )
    );

    handleSendAssistanceLog(this.choosenTool, logText);
    this.setState({
      requestState: pot.noneError(ErrorType.LOGIN_ERROR),
      errorCode
    });
  };

  private handleLoginSuccess = (token: SessionToken) => {
    handleSendAssistanceLog(this.choosenTool, `login success`);
    this.props.dispatchLoginSuccess(token, this.idp);
  };

  private setRequestStateToLoading = (): void =>
    this.setState({ requestState: pot.noneLoading });

  private handleNavigationStateChange = (event: WebViewNavigation): void => {
    if (event.url) {
      const urlChanged = getUrlBasepath(event.url);
      if (urlChanged !== this.state.loginTrace) {
        this.props.dispatchIdpLoginUrlChanged(urlChanged);
        this.updateLoginTrace(urlChanged);
      }
    }
    const isAssertion = pipe(
      event.url,
      O.fromNullable,
      O.fold(
        () => false,
        s => s.indexOf("/assertionConsumerService") > -1
      )
    );
    this.setState({
      requestState:
        event.loading || isAssertion ? pot.noneLoading : pot.some(true)
    });
  };

  private handleShouldStartLoading = (event: WebViewNavigation): boolean => {
    const url = event.url;
    // if an intent is coming from the IDP login form, extract the fallbackUrl and use it in Linking.openURL
    const idpIntent = getIntentFallbackUrl(url);
    if (O.isSome(idpIntent)) {
      void mixpanelTrack("SPID_LOGIN_INTENT", {
        idp: this.props.loggedOutWithIdpAuth?.idp
      });
      void Linking.openURL(idpIntent.value);
      return false;
    }

    const isLoginUrlWithToken = onLoginUriChanged(
      this.handleLoginFailure,
      this.handleLoginSuccess
    )(event);
    // URL can be loaded if it's not the login URL containing the session token - this avoids
    // making a (useless) GET request with the session in the URL
    return !isLoginUrlWithToken;
  };

  private renderMask = () => {
    if (pot.isLoading(this.state.requestState)) {
      return (
        <View style={styles.refreshIndicatorContainer}>
          <RefreshIndicator />
        </View>
      );
    } else if (pot.isError(this.state.requestState)) {
      const errorType = this.state.requestState.error;
      const errorTranslationKey = `authentication.errors.spid.error_${this.state.errorCode}`;

      return (
        <View style={styles.errorContainer}>
          <Image source={brokenLinkImage} resizeMode="contain" />
          <View>
            <VSpacer size={8} />
            <H2 weight="Bold">
              {I18n.t(
                errorType === ErrorType.LOADING_ERROR
                  ? "authentication.errors.network.title"
                  : "authentication.errors.login.title"
              )}
            </H2>
          </View>

          {errorType === ErrorType.LOGIN_ERROR && (
            <View>
              <VSpacer size={8} />
              <View style={IOStyles.alignCenter}>
                <Body>
                  {I18n.t(errorTranslationKey, {
                    defaultValue: I18n.t("authentication.errors.spid.unknown")
                  })}
                </Body>
              </View>
              <VSpacer size={8} />
            </View>
          )}

          <View style={styles.errorButtonsContainer}>
            <ButtonDefaultOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.cancelButtonStyle}
              block={true}
              light={true}
              bordered={true}
            >
              <NBButtonText>{I18n.t("global.buttons.cancel")}</NBButtonText>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              onPress={this.setRequestStateToLoading}
              style={styles.flex2}
              block={true}
              primary={true}
            >
              <NBButtonText>{I18n.t("global.buttons.retry")}</NBButtonText>
            </ButtonDefaultOpacity>
          </View>
        </View>
      );
    }
    // loading complete, no mask needed
    return null;
  };

  get contextualHelp() {
    const { selectedIdpTextData } = this.props;

    if (O.isNone(selectedIdpTextData)) {
      return {
        title: I18n.t("authentication.idp_login.contextualHelpTitle"),
        body: () => (
          <Markdown>
            {I18n.t("authentication.idp_login.contextualHelpContent")}
          </Markdown>
        )
      };
    }
    const idpTextData = selectedIdpTextData.value;
    return IdpCustomContextualHelpContent(idpTextData);
  }

  public render() {
    const { loggedOutWithIdpAuth, loggedInAuth } = this.props;
    const hasError = pot.isError(this.state.requestState);

    if (loggedInAuth) {
      return <IdpSuccessfulAuthentication />;
    }

    if (!loggedOutWithIdpAuth) {
      // This condition will be true only temporarily (if the navigation occurs
      // before the redux state is updated successfully)
      return <LoadingSpinnerOverlay isLoading={true} />;
    }
    const loginUri = getIdpLoginUri(loggedOutWithIdpAuth.idp.id);
    return (
      <BaseScreenComponent
        goBack={true}
        contextualHelp={this.contextualHelp}
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
              source={{ uri: loginUri }}
              onError={this.handleLoadingError}
              javaScriptEnabled={true}
              onNavigationStateChange={this.handleNavigationStateChange}
              onShouldStartLoadWithRequest={this.handleShouldStartLoading}
            />
          )}
          {this.renderMask()}
        </View>
      </BaseScreenComponent>
    );
  }
}

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

import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { Image, NavState, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import Markdown from "../../components/ui/Markdown";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import * as config from "../../config";
import I18n from "../../i18n";
import { loginFailure, loginSuccess } from "../../store/actions/authentication";
import { idpLoginUrlChanged } from "../../store/actions/authentication";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedOutWithIdp
} from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import { SessionToken } from "../../types/SessionToken";
import { extractLoginResult } from "../../utils/login";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  requestState: pot.Pot<true, "LOADING_ERROR" | "LOGIN_ERROR">;
  errorCode?: string;
};

const LOGIN_BASE_URL = `${
  config.apiUrlPrefix
}/login?authLevel=SpidL2&entityID=`;

const brokenLinkImage = require("../../../img/broken-link.png");

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
  }
});

/**
 * Extract the login result from the given url.
 * Return true if the url contains login pattern & token
 */
const onNavigationStateChange = (
  onFailure: (errorCode: string | undefined) => void,
  onSuccess: (_: SessionToken) => void
) => (navState: NavState): boolean => {
  if (navState.url) {
    // If the url is not related to login this will be `null`
    const loginResult = extractLoginResult(navState.url);
    if (loginResult) {
      if (loginResult.success) {
        // In case of successful login
        onSuccess(loginResult.token);
        return true;
      } else {
        // In case of login failure
        onFailure(loginResult.errorCode);
      }
    }
  }
  return false;
};

const contextualHelp = {
  title: I18n.t("authentication.idp_login.contextualHelpTitle"),
  body: () => (
    <Markdown>
      {I18n.t("authentication.idp_login.contextualHelpContent")}
    </Markdown>
  )
};

/**
 * A screen that allow the user to login with an IDP.
 * The IDP page is opened in a WebView
 */
class IdpLoginScreen extends React.Component<Props, State> {
  private loginTrace?: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      requestState: pot.noneLoading
    };
  }

  private updateLoginTrace = (url: string): void => {
    // tslint:disable-next-line: no-object-mutation
    this.loginTrace = url;
  };

  private handleLoadingError = (): void => {
    this.setState({
      requestState: pot.noneError("LOADING_ERROR")
    });
  };

  private handleLoginFailure = (errorCode?: string) => {
    this.props.dispatchLoginFailure(
      new Error(`login failure with code ${errorCode || "n/a"}`)
    );
    this.setState({
      requestState: pot.noneError("LOGIN_ERROR"),
      errorCode
    });
  };

  private goBack = this.props.navigation.goBack;

  private setRequestStateToLoading = (): void =>
    this.setState({ requestState: pot.noneLoading });

  private handleNavigationStateChange = (event: NavState): void => {
    if (event.url && event.url !== this.loginTrace) {
      const urlChanged = event.url.split("?")[0];
      this.props.dispatchIdpLoginUrlChanged(urlChanged);
      this.updateLoginTrace(urlChanged);
    }
    this.setState({
      requestState: event.loading ? pot.noneLoading : pot.some(true)
    });
  };

  private handleShouldStartLoading = (event: NavState): boolean => {
    const isLoginUrlWithToken = onNavigationStateChange(
      this.handleLoginFailure,
      this.props.dispatchLoginSuccess
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
      const errorTranslationKey = `authentication.errors.spid.error_${
        this.state.errorCode
      }`;

      return (
        <View style={styles.errorContainer}>
          <Image source={brokenLinkImage} resizeMode="contain" />
          <Text style={styles.errorTitle} bold={true}>
            {I18n.t(
              errorType === "LOADING_ERROR"
                ? "authentication.errors.network.title"
                : "authentication.errors.login.title"
            )}
          </Text>

          {errorType === "LOGIN_ERROR" && (
            <Text style={styles.errorBody}>
              {I18n.t(errorTranslationKey, {
                defaultValue: I18n.t("authentication.errors.spid.unknown")
              })}
            </Text>
          )}

          <View style={styles.errorButtonsContainer}>
            <ButtonDefaultOpacity
              onPress={this.goBack}
              style={styles.cancelButtonStyle}
              block={true}
              light={true}
              bordered={true}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              onPress={this.setRequestStateToLoading}
              style={{ flex: 2 }}
              block={true}
              primary={true}
            >
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </ButtonDefaultOpacity>
          </View>
        </View>
      );
    }
    // loading complete, no mask needed
    return null;
  };

  public render() {
    const { loggedOutWithIdpAuth, loggedInAuth } = this.props;
    const hasError = pot.isError(this.state.requestState);

    if (loggedInAuth) {
      return <IdpSuccessfulAuthentication />;
    }

    if (!loggedOutWithIdpAuth) {
      // FIXME: perhaps as a safe bet, navigate to the IdP selection screen on mount?
      //      https://www.pivotaltracker.com/story/show/169541951
      return null;
    }
    const loginUri = LOGIN_BASE_URL + loggedOutWithIdpAuth.idp.entityID;

    return (
      <BaseScreenComponent
        goBack={true}
        contextualHelp={contextualHelp}
        headerTitle={`${I18n.t("authentication.idp_login.headerTitle")} - ${
          loggedOutWithIdpAuth.idp.name
        }`}
      >
        {!hasError && (
          <WebView
            textZoom={100}
            source={{ uri: loginUri }}
            onError={this.handleLoadingError}
            javaScriptEnabled={true}
            onNavigationStateChange={this.handleNavigationStateChange}
            onShouldStartLoadWithRequest={this.handleShouldStartLoading}
          />
        )}
        {this.renderMask()}
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  loggedOutWithIdpAuth: isLoggedOutWithIdp(state.authentication)
    ? state.authentication
    : undefined,
  loggedInAuth: isLoggedIn(state.authentication)
    ? state.authentication
    : undefined
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchIdpLoginUrlChanged: (url: string) =>
    dispatch(idpLoginUrlChanged({ url })),
  dispatchLoginSuccess: (token: SessionToken) => dispatch(loginSuccess(token)),
  dispatchLoginFailure: (error: Error) => dispatch(loginFailure(error))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IdpLoginScreen);

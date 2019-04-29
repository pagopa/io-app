import { Button, Text, View } from "native-base";
import * as React from "react";
import { Image, NavState, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { idpLoginUrlChanged } from "../../store/actions/authentication";

import * as pot from "italia-ts-commons/lib/pot";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import * as config from "../../config";
import I18n from "../../i18n";
import { loginFailure, loginSuccess } from "../../store/actions/authentication";
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
  errorBody: { marginTop: 10, marginBottom: 10, textAlign: "center" },
  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  }
});

const onNavigationStateChange = (
  onFailure: () => void,
  onSuccess: (_: SessionToken) => void
) => (navState: NavState) => {
  // Extract the login result from the url.
  // If the url is not related to login this will be `null`
  if (navState.url) {
    const loginResult = extractLoginResult(navState.url);
    if (loginResult) {
      if (loginResult.success) {
        // In case of successful login
        onSuccess(loginResult.token);
      } else {
        // In case of login failure
        onFailure();
      }
    }
  }
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

  private handleLoginFailure = () => {
    this.props.dispatchLoginFailure();
    this.setState({
      requestState: pot.noneError("LOGIN_ERROR")
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

    onNavigationStateChange(
      this.handleLoginFailure,
      this.props.dispatchLoginSuccess
    )(event);
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
          <Text style={styles.errorBody}>
            {I18n.t(
              errorType === "LOADING_ERROR"
                ? "authentication.errors.network.body"
                : "authentication.errors.login.body"
            )}
          </Text>
          <View style={styles.errorButtonsContainer}>
            <Button
              onPress={this.goBack}
              style={{ flex: 1 }}
              block={true}
              light={true}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
            <Button
              onPress={this.setRequestStateToLoading}
              style={{ flex: 2 }}
              block={true}
              primary={true}
            >
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </Button>
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
      return null;
    }
    const loginUri = LOGIN_BASE_URL + loggedOutWithIdpAuth.idp.entityID;
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={`${I18n.t("authentication.idp_login.headerTitle")} - ${
          loggedOutWithIdpAuth.idp.name
        }`}
      >
        {!hasError && (
          <WebView
            source={{ uri: loginUri }}
            onError={this.handleLoadingError}
            javaScriptEnabled={true}
            onNavigationStateChange={this.handleNavigationStateChange}
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
  dispatchLoginFailure: () => dispatch(loginFailure())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IdpLoginScreen);

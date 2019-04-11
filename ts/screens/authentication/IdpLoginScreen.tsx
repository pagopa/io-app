import { Button, Text, View } from "native-base";
import * as React from "react";
import { Image, NavState, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import * as config from "../../config";
import I18n from "../../i18n";
import { loginFailure, loginSuccess } from "../../store/actions/authentication";
import { ReduxProps } from "../../store/actions/types";
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

type Props = ReturnType<typeof mapStateToProps> & ReduxProps & OwnProps;

/**
 * web request can be viewed in one of these states:
 * 'loading' is the initial state, the webview receives the url directly from props so it starts to load
 * 'completed' means the request has been successfully executed
 * 'error' means the request got an error (endpoint unreachable, timeout, http errors (404,500...))
 */
type RequestState = "LOADING" | "COMPLETED" | "ERROR";

type State = {
  requestState: RequestState;
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
    marginTop: 10,
    fontWeight: "bold"
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
  constructor(props: Props) {
    super(props);

    this.state = {
      requestState: "LOADING"
    };
  }

  public render() {
    const { loggedOutWithIdpAuth, loggedInAuth } = this.props;
    const hasError = this.state.requestState === "ERROR";

    if (loggedInAuth) {
      return <IdpSuccessfulAuthentication />;
    }

    if (!loggedOutWithIdpAuth) {
      // FIXME: perhaps as a safe bet, navigate to the IdP selection screen on mount?
      return null;
    }
    const loginUri = LOGIN_BASE_URL + loggedOutWithIdpAuth.idp.entityID;

    const handleOnError = (): void => {
      this.setState({
        requestState: "ERROR"
      });
    };

    const goBack = () => this.props.navigation.goBack();
    const refresh = () => this.setState({ requestState: "LOADING" });

    const handleNavigationStateChange = (event: NavState): void => {
      this.setState({
        requestState: event.loading ? "LOADING" : "COMPLETED"
      });

      onNavigationStateChange(
        () => this.props.dispatch(loginFailure()),
        token => this.props.dispatch(loginSuccess(token))
      )(event);
    };

    const renderMask = () => {
      switch (this.state.requestState) {
        case "COMPLETED":
          return null;
        case "ERROR":
          return (
            <View style={styles.errorContainer}>
              <Image source={brokenLinkImage} resizeMode="contain" />
              <Text style={styles.errorTitle}>
                {I18n.t("authentication.errors.network.title")}
              </Text>
              <Text style={styles.errorBody}>
                {I18n.t("authentication.errors.network.body")}
              </Text>
              <View style={styles.errorButtonsContainer}>
                <Button
                  onPress={goBack}
                  style={{ flex: 1 }}
                  block={true}
                  light={true}
                >
                  <Text>{I18n.t("global.buttons.cancel")}</Text>
                </Button>
                <Button
                  onPress={refresh}
                  style={{ flex: 2 }}
                  block={true}
                  primary={true}
                >
                  <Text>{I18n.t("global.buttons.retry")}</Text>
                </Button>
              </View>
            </View>
          );
        case "LOADING":
          return (
            <View style={styles.refreshIndicatorContainer}>
              <RefreshIndicator />
            </View>
          );
      }
    };

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
            onError={handleOnError}
            javaScriptEnabled={true}
            onNavigationStateChange={handleNavigationStateChange}
          />
        )}
        {renderMask()}
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

export default connect(mapStateToProps)(IdpLoginScreen);

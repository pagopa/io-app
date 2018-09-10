import { Body, Container, Left, Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, NavState, StyleSheet, WebView } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import GoBackButton from "../../components/GoBackButton";
import AppHeader from "../../components/ui/AppHeader";
import * as config from "../../config";
import I18n from "../../i18n";
import { loginFailure, loginSuccess } from "../../store/actions/authentication";
import { ReduxProps } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedOutWithIdp,
  LoggedInWithoutSessionInfo,
  LoggedInWithSessionInfo,
  LoggedOutWithIdp
} from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { SessionToken } from "../../types/SessionToken";
import { extractLoginResult } from "../../utils/login";

type ReduxMappedProps = {
  loggedOutWithIdpAuth?: LoggedOutWithIdp;
  loggedInAuth?: LoggedInWithoutSessionInfo | LoggedInWithSessionInfo;
};

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxMappedProps & ReduxProps & OwnProps;

type State = {
  isWebViewLoading: boolean;
};

const LOGIN_BASE_URL = `${
  config.apiUrlPrefix
}/login?authLevel=SpidL2&entityID=`;

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
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
      isWebViewLoading: true
    };
  }

  public render() {
    const { loggedOutWithIdpAuth, loggedInAuth } = this.props;
    const { isWebViewLoading } = this.state;

    if (loggedInAuth) {
      // FIXME: show a nice screen with succesful login message
      return <Text>OK</Text>;
    }

    if (!loggedOutWithIdpAuth) {
      // FIXME: perhaps as a safe bet, navigate to the IdP selection screen on mount?
      return null;
    }
    const loginUri = LOGIN_BASE_URL + loggedOutWithIdpAuth.idp.entityID;

    const handleNavigationStateChange = (event: NavState): void => {
      this.setState({
        isWebViewLoading: event.loading ? event.loading : false
      });

      onNavigationStateChange(
        () => this.props.dispatch(loginFailure()),
        token => this.props.dispatch(loginSuccess(token))
      )(event);
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton testID="back-button" />
          </Left>
          <Body>
            <Text>
              {`${I18n.t("authentication.idp_login.headerTitle")} - ${
                loggedOutWithIdpAuth.idp.name
              }`}
            </Text>
          </Body>
        </AppHeader>
        <WebView
          source={{ uri: loginUri }}
          javaScriptEnabled={true}
          onNavigationStateChange={handleNavigationStateChange}
        />
        {isWebViewLoading && (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator color={variables.brandPrimary} />
          </View>
        )}
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  loggedOutWithIdpAuth: isLoggedOutWithIdp(state.authentication)
    ? state.authentication
    : undefined,
  loggedInAuth: isLoggedIn(state.authentication)
    ? state.authentication
    : undefined
});

export default connect(mapStateToProps)(IdpLoginScreen);

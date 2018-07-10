import { Body, Button, Container, Left, Text } from "native-base";
import * as React from "react";
import { NavState, WebView } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import * as config from "../../config";
import I18n from "../../i18n";
import { loginFailure, loginSuccess } from "../../store/actions/authentication";
import { ReduxProps } from "../../store/actions/types";
import {
  AuthenticationState,
  isLoggedOutWithoutIdp
} from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import { extractLoginResult } from "../../utils/login";

type ReduxMappedProps = {
  authentication: AuthenticationState;
};
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};
type Props = ReduxMappedProps & ReduxProps & OwnProps;
const LOGIN_BASE_URL = `${config.apiUrlPrefix}/login?entityID=`;
/**
 * A screen that allow the user to login with an IDP.
 * The IDP page is opened in a WebView
 */
class IdpLoginScreen extends React.Component<Props, never> {
  public render() {
    const { authentication } = this.props;
    if (isLoggedOutWithoutIdp(authentication)) {
      return null;
    }
    const loginUri = LOGIN_BASE_URL + authentication.idp.entityID;
    const onPress = () => this.props.navigation.goBack();
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={onPress} testID="back-button">
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("authentication.idp_login.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <WebView
          source={{ uri: loginUri }}
          javaScriptEnabled={true}
          startInLoadingState={true}
          onNavigationStateChange={this.onNavigationStateChange}
        />
      </Container>
    );
  }
  public onNavigationStateChange = (navState: NavState) => {
    // Extract the login result from the url.
    // If the url is not related to login this will be `null`
    if (navState.url) {
      const loginResult = extractLoginResult(navState.url);
      if (loginResult) {
        if (loginResult.success) {
          // In case of successful login
          this.props.dispatch(loginSuccess(loginResult.token));
        } else {
          // In case of login failure
          this.props.dispatch(loginFailure());
        }
      }
    }
  };
}
const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  authentication: state.authentication
});
export default connect(mapStateToProps)(IdpLoginScreen);

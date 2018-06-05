import { Body, Button, Container, Icon, Left, Text } from "native-base";
import * as React from "react";
import { WebView } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import AppHeader from "../../components/ui/AppHeader";
import * as config from "../../config";
import I18n from "../../i18n";
import { GlobalState } from "../../reducers/types";
import { loginFailure, loginSuccess } from "../../store/actions/session";
import { ReduxProps } from "../../store/actions/types";
import {
  isUnauthenticatedWithoutIdpSessionState,
  SessionState
} from "../../store/reducers/session";
import { extractLoginResult } from "../../utils/login";
type ReduxMappedProps = {
  session: SessionState;
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
    const { session } = this.props;
    if (isUnauthenticatedWithoutIdpSessionState(session)) {
      return null;
    }
    const loginUri = LOGIN_BASE_URL + session.idp.entityID;
    const onPress = () => this.props.navigation.goBack();
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={onPress}>
              <Icon name="chevron-left" />
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
  public onNavigationStateChange = (navState: any) => {
    const url = navState.url;
    // Extract the login result from the url.
    // If the url is not related to login this will be `null`
    const loginResult = extractLoginResult(url);
    if (loginResult) {
      if (loginResult.success) {
        // In case of successful login
        this.props.dispatch(loginSuccess(loginResult.token));
      } else {
        // In case of login failure
        this.props.dispatch(loginFailure());
      }
    }
  };
}
const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  session: state.session
});
export default connect(mapStateToProps)(IdpLoginScreen);

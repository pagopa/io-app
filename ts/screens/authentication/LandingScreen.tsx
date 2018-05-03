import {
  Body,
  Button,
  Container,
  Content,
  Icon,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { ReduxProps } from "../../actions/types";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
type ReduxMappedProps = {};
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};
type Props = ReduxMappedProps & ReduxProps & OwnProps;
/**
 * A screen where the user can choose to login with SPID or get more informations.
 */
class LandingScreen extends React.Component<Props, never> {
  public render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{I18n.t("authentication.landing.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <Content />
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            iconLeft={true}
            onPress={(): boolean =>
              this.props.navigation.navigate(
                ROUTES.AUTHENTICATION_IDP_SELECTION
              )
            }
          >
            <Icon name="user" />
            <Text>{I18n.t("authentication.landing.login")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            small={true}
            transparent={true}
            onPress={(): boolean =>
              this.props.navigation.navigate(
                ROUTES.AUTHENTICATION_SPID_INFORMATION_REQUEST
              )
            }
          >
            <Text>{I18n.t("authentication.landing.nospid")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
export default connect()(LandingScreen);

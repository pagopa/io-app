import { Body, Button, Container, Content, Text, View } from "native-base";
import * as React from "react";
import DeviceInfo from "react-native-device-info";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import variables from "../../theme/variables";

type ReduxMappedProps = {};
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};
type Props = ReduxMappedProps & ReduxProps & OwnProps;
/**
 * A screen where the user can choose to login with SPID or get more informations.
 */
class LandingScreen extends React.Component<Props, never> {
  private navigateToIdpSelection() {
    this.props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);
  }

  private navigateToSpidInformationRequest() {
    this.props.navigation.navigate(
      ROUTES.AUTHENTICATION_SPID_INFORMATION_REQUEST
    );
  }
  public render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{DeviceInfo.getApplicationName()}</Text>
          </Body>
        </AppHeader>
        <Content />
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            iconLeft={true}
            onPress={_ => this.navigateToIdpSelection()}
          >
            <IconFont name="io-profilo" color={variables.colorWhite} />
            <Text>{I18n.t("authentication.landing.login")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            small={true}
            transparent={true}
            onPress={_ => this.navigateToSpidInformationRequest()}
          >
            <Text>{I18n.t("authentication.landing.nospid")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
export default connect()(LandingScreen);

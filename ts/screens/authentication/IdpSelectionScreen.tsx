import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Icon,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { ReduxProps } from "../../actions/types";
import { IIdentityProvider } from "../../api/types";
import IdpsGrid from "../../components/IdpsGrid";
import AppHeader from "../../components/ui/AppHeader";
import * as config from "../../config";
import I18n from "../../i18n";
import { selectIdp } from "../../store/actions/session";

type ReduxMappedProps = {};
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};
type Props = ReduxMappedProps & ReduxProps & OwnProps;
const idps: ReadonlyArray<IIdentityProvider> = [
  {
    id: "infocertid",
    name: "Infocert",
    logo: require("../../../img/spid-idp-infocertid.png"),
    entityID: "infocertid",
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "posteid",
    name: "Poste Italiane",
    logo: require("../../../img/spid-idp-posteid.png"),
    entityID: "posteid",
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  {
    id: "sielteid",
    name: "Sielte",
    logo: require("../../../img/spid-idp-sielteid.png"),
    entityID: "sielteid",
    profileUrl: "https://myid.sieltecloud.it/profile/"
  },
  {
    id: "timid",
    name: "Telecom Italia",
    logo: require("../../../img/spid-idp-timid.png"),
    entityID: "timid",
    profileUrl: "https://id.tim.it/identity/private/"
  },
  {
    id: "arubaid",
    name: "Aruba.it",
    logo: require("../../../img/spid-idp-arubaid.png"),
    entityID: "arubaid",
    profileUrl: "http://selfcarespid.aruba.it"
  }
];
const testIdp = {
  id: "test",
  name: "Test",
  logo: require("../../../img/spid.png"),
  entityID: "spid-testenv-identityserver",
  profileUrl: "https://italia-backend/profile.html"
};
const enabledIdps = config.enableTestIdp ? [...idps, testIdp] : idps;
const styles = StyleSheet.create({
  spidLogo: {
    width: 80,
    height: 30
  },
  subheader: {
    backgroundColor: "#FFFFFF",
    padding: 24
  }
});
/**
 * A screen where the user choose the SPID IPD to login with.
 */
class IdpSelectionScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
  }

  private onIdpSelected(idp: IIdentityProvider): void {
    this.props.dispatch(selectIdp(idp));
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("authentication.idp_selection.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <View style={styles.subheader}>
          <Image
            source={require("../../../img/spid.png")}
            style={styles.spidLogo}
          />
          <View spacer={true} />
          <H1>{I18n.t("authentication.idp_selection.contentTitle")}</H1>
        </View>
        <Content alternative={true}>
          <IdpsGrid
            idps={enabledIdps}
            onIdpSelected={idp => this.onIdpSelected(idp)}
          />
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={_ => this.props.navigation.goBack()}
          >
            <Text>{I18n.t("authentication.idp_selection.cancel")}</Text>
          </Button>
        </Content>
        <View footer={true}>
          <Button block={true} transparent={true}>
            <Text>{I18n.t("authentication.landing.nospid")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
export default connect()(IdpSelectionScreen);

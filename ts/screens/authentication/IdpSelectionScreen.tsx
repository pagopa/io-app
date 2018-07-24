import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import IdpsGrid from "../../components/IdpsGrid";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import * as config from "../../config";
import I18n from "../../i18n";
import { IdentityProvider } from "../../models/IdentityProvider";
import { idpSelected } from "../../store/actions/authentication";
import { ReduxProps } from "../../store/actions/types";
import variables from "../../theme/variables";

type ReduxMappedProps = {};
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};
type Props = ReduxMappedProps & ReduxProps & OwnProps;
const idps: ReadonlyArray<IdentityProvider> = [
  {
    id: "arubaid",
    name: "Aruba ID",
    logo: require("../../../img/spid-idp-arubaid.png"),
    entityID: "arubaid",
    profileUrl: "http://selfcarespid.aruba.it"
  },
  {
    id: "infocertid",
    name: "Infocert ID",
    logo: require("../../../img/spid-idp-infocertid.png"),
    entityID: "infocertid",
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "intesaid",
    name: "Intesa ID",
    logo: require("../../../img/spid-idp-intesaid.png"),
    entityID: "intesaid",
    profileUrl: "https://spid.intesa.it"
  },
  {
    id: "namirialid",
    name: "Namirial ID",
    logo: require("../../../img/spid-idp-namirialid.png"),
    entityID: "namirialid",
    profileUrl: "https://idp.namirialtsp.com/idp"
  },
  {
    id: "posteid",
    name: "Poste ID",
    logo: require("../../../img/spid-idp-posteid.png"),
    entityID: "posteid",
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  {
    id: "sielteid",
    name: "Sielte ID",
    logo: require("../../../img/spid-idp-sielteid.png"),
    entityID: "sielteid",
    profileUrl: "https://myid.sieltecloud.it/profile/"
  },
  {
    id: "spiditalia",
    name: "SPIDItalia Register.it",
    logo: require("../../../img/spid-idp-spiditalia.png"),
    entityID: "spiditalia",
    profileUrl: "https://spid.register.it"
  },
  {
    id: "timid",
    name: "Telecom Italia",
    logo: require("../../../img/spid-idp-timid.png"),
    entityID: "timid",
    profileUrl: "https://id.tim.it/identity/private/"
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
  },
  gridContainer: {
    padding: variables.contentPadding,
    flex: 1
  }
});
/**
 * A screen where the user choose the SPID IPD to login with.
 */
class IdpSelectionScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
  }

  private onIdpSelected(idp: IdentityProvider): void {
    this.props.dispatch(idpSelected(idp));
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("authentication.idp_selection.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <Content noPadded={true} alternative={true}>
          <View style={styles.subheader}>
            <Image
              source={require("../../../img/spid.png")}
              style={styles.spidLogo}
            />
            <View spacer={true} />
            <H1>{I18n.t("authentication.idp_selection.contentTitle")}</H1>
          </View>
          <View style={styles.gridContainer} testID="idps-view">
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
          </View>
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

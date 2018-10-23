import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import IdpsGrid from "../../components/IdpsGrid";
import { InfoBanner } from "../../components/InfoBanner";

import * as config from "../../config";

import I18n from "../../i18n";

import { IdentityProvider } from "../../models/IdentityProvider";

import ROUTES from "../../navigation/routes";

import { idpSelected } from "../../store/actions/authentication";
import { ReduxProps } from "../../store/actions/types";

import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";

import variables from "../../theme/variables";

import TopScreenComponent from "../../components/screens/TopScreenComponent";

interface ReduxMappedProps {
  isSessionExpired: boolean;
}
interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}
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
  entityID: "xx_testenv2",
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
const IdpSelectionScreen: React.SFC<Props> = props => {
  const goBack = () => props.navigation.goBack();

  const onIdpSelected = (idp: IdentityProvider) => {
    props.dispatch(idpSelected(idp));
    props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_LOGIN);
  };

  return (
    <TopScreenComponent
      goBack={goBack}
      banner={
        props.isSessionExpired && (
          <InfoBanner
            title={I18n.t("authentication.expiredSessionBanner.title")}
            message={I18n.t("authentication.expiredSessionBanner.message")}
          />
        )
      }
      headerTitle={I18n.t("authentication.idp_selection.headerTitle")}
      title={I18n.t("authentication.idp_selection.contentTitle")}
      subtitle={I18n.t("authentication.idp_selection.subtitle")}
    >
      <Content noPadded={true} alternative={true}>
        <View style={styles.gridContainer} testID="idps-view">
          <IdpsGrid idps={enabledIdps} onIdpSelected={onIdpSelected} />
          <View spacer={true} />
          <Button block={true} light={true} bordered={true} onPress={goBack}>
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </Content>
    </TopScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isSessionExpired: isSessionExpiredSelector(state)
});

export default connect(mapStateToProps)(IdpSelectionScreen);

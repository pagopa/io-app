import { Content, H3, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import IdpsGrid from "../../components/IdpsGrid";
import { InfoBanner } from "../../components/InfoBanner";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import * as config from "../../config";
import I18n from "../../i18n";
import { IdentityProvider } from "../../models/IdentityProvider";
import ROUTES from "../../navigation/routes";
import { idpSelected } from "../../store/actions/authentication";
import { ReduxProps } from "../../store/actions/types";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}

type Props = ReturnType<typeof mapStateToProps> & ReduxProps & OwnProps;

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
    id: "lepidaid",
    name: "Lepida ID",
    logo: require("../../../img/spid-idp-lepidaid.png"),
    entityID: "lepidaid",
    profileUrl: "https://id.lepida.it/"
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
  gridContainer: {
    padding: variables.contentPadding,
    flex: 1,
    backgroundColor: variables.contentAlternativeBackground
  }
});
/**
 * A screen where the user choose the SPID IPD to login with.
 */
const IdpSelectionScreen: React.SFC<Props> = props => {
  const onIdpSelected = (idp: IdentityProvider) => {
    props.dispatch(idpSelected(idp));
    props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_LOGIN);
  };

  return (
    <BaseScreenComponent
      goBack={props.navigation.goBack}
      headerTitle={I18n.t("authentication.idp_selection.headerTitle")}
    >
      <Content noPadded={true} overScrollMode="never" bounces={false}>
        {props.isSessionExpired && (
          <React.Fragment>
            <InfoBanner
              message={I18n.t("authentication.expiredSessionBanner.message")}
            />
            <View spacer={true} />
          </React.Fragment>
        )}
        <ScreenHeader
          heading={
            <H3>{I18n.t("authentication.idp_selection.contentTitle")}</H3>
          }
        />
        <View style={styles.gridContainer} testID="idps-view">
          <IdpsGrid idps={enabledIdps} onIdpSelected={onIdpSelected} />
          <View spacer={true} />
          <ButtonDefaultOpacity
            block={true}
            light={true}
            bordered={true}
            onPress={props.navigation.goBack}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </ButtonDefaultOpacity>
        </View>
      </Content>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isSessionExpired: isSessionExpiredSelector(state)
});

export default connect(mapStateToProps)(IdpSelectionScreen);

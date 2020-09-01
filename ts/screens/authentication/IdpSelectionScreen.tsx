import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { instabugLog, TypeLogs } from "../../boot/configureInstabug";
import AdviceComponent from "../../components/AdviceComponent";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import IdpsGrid from "../../components/IdpsGrid";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import I18n from "../../i18n";
import { IdentityProvider } from "../../models/IdentityProvider";
import ROUTES from "../../navigation/routes";
import { idpSelected } from "../../store/actions/authentication";
import variables from "../../theme/variables";

type Props = ReturnType<typeof mapDispatchToProps> & NavigationScreenProps;

type State = Readonly<{
  counter: number;
}>;

// since this is a test SPID idp, we set isTestIdp flag to avoid rendering.
// It is used has a placeholder to handle taps count on it and open when
// taps count threadshold is reached (see https://www.pivotaltracker.com/story/show/172082895)
const testIdp: IdentityProvider = {
  id: "test",
  name: "Test",
  logo: require("../../../img/spid.png"),
  entityID: "xx_testenv2",
  profileUrl: "https://italia-backend/profile.html",
  isTestIdp: true
};

const TAPS_TO_OPEN_TESTIDP = 5;

const idps: ReadonlyArray<IdentityProvider> = [
  {
    id: "arubaid",
    name: "Aruba",
    logo: require("../../../img/spid-idp-arubaid.png"),
    entityID: "arubaid",
    profileUrl: "http://selfcarespid.aruba.it"
  },
  {
    id: "infocertid",
    name: "Infocert",
    logo: require("../../../img/spid-idp-infocertid.png"),
    entityID: "infocertid",
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "intesaid",
    name: "Intesa",
    logo: require("../../../img/spid-idp-intesaid.png"),
    entityID: "intesaid",
    profileUrl: "https://spid.intesa.it"
  },
  {
    id: "lepidaid",
    name: "Lepida",
    logo: require("../../../img/spid-idp-lepidaid.png"),
    entityID: "lepidaid",
    profileUrl: "https://id.lepida.it/"
  },
  {
    id: "namirialid",
    name: "Namirial",
    logo: require("../../../img/spid-idp-namirialid.png"),
    entityID: "namirialid",
    profileUrl: "https://idp.namirialtsp.com/idp"
  },
  {
    id: "posteid",
    name: "Poste",
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
  },
  testIdp
];

const styles = StyleSheet.create({
  gridContainer: {
    padding: variables.contentPadding,
    flex: 1,
    backgroundColor: variables.brandGray
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.idp_selection.contextualHelpTitle",
  body: "authentication.idp_selection.contextualHelpContent"
};

/**
 * A screen where the user choose the SPID IPD to login with.
 */
class IdpSelectionScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { counter: 0 };
  }

  private onIdpSelected = (idp: IdentityProvider) => {
    const { counter } = this.state;
    if (idp.isTestIdp === true && counter < TAPS_TO_OPEN_TESTIDP) {
      const newValue = (counter + 1) % (TAPS_TO_OPEN_TESTIDP + 1);
      this.setState({ counter: newValue });
      return;
    }
    this.props.setSelectedIdp(idp);
    instabugLog(`IDP selected: ${idp.id}`, TypeLogs.DEBUG, "login");
    this.props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_LOGIN);
  };

  public componentDidUpdate() {
    if (this.state.counter === TAPS_TO_OPEN_TESTIDP) {
      this.props.setSelectedIdp(testIdp);
      this.props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_TEST);
    }
  }

  public render() {
    return (
      <BaseScreenComponent
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["authentication_IPD_selection"]}
        goBack={this.props.navigation.goBack}
        headerTitle={I18n.t("authentication.idp_selection.headerTitle")}
      >
        <Content noPadded={true} overScrollMode={"never"} bounces={false}>
          <ScreenContentHeader
            title={I18n.t("authentication.idp_selection.contentTitle")}
          />
          <View style={styles.gridContainer} testID={"idps-view"}>
            <IdpsGrid idps={idps} onIdpSelected={this.onIdpSelected} />
            <View spacer={true} />
            <ButtonDefaultOpacity
              block={true}
              light={true}
              bordered={true}
              onPress={this.props.navigation.goBack}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </ButtonDefaultOpacity>
          </View>
          <View style={{ padding: variables.contentPadding }}>
            <View spacer={true} />
            <AdviceComponent
              text={I18n.t("login.expiration_info")}
              iconColor={"black"}
            />
          </View>
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSelectedIdp: (idp: IdentityProvider) => dispatch(idpSelected(idp))
});

export default connect(undefined, mapDispatchToProps)(IdpSelectionScreen);

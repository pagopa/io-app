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
import ROUTES from "../../navigation/routes";
import { idpSelected } from "../../store/actions/authentication";
import variables from "../../theme/variables";
import { GlobalState } from "../../store/reducers/types";
import { idpsSelector } from "../../store/reducers/content";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { testIdp } from "../../store/reducers/__mock__/idps";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationScreenProps;

type State = Readonly<{
  counter: number;
}>;

const TAPS_TO_OPEN_TESTIDP = 5;

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

  private onIdpSelected = (idp: SpidIdp) => {
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
      this.setState({ counter: 0 });
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
            <IdpsGrid
              idps={[...this.props.idps, testIdp]}
              onIdpSelected={this.onIdpSelected}
            />

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

const mapStateToProps = (state: GlobalState) => ({
  idps: idpsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSelectedIdp: (idp: SpidIdp) => dispatch(idpSelected(idp))
});

export default connect(mapStateToProps, mapDispatchToProps)(IdpSelectionScreen);

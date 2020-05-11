/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Body, Content, List, ListItem, Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { ContextualHelp } from "../../components/ContextualHelp";
import { DevScreenButton } from "../../components/DevScreenButton";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { HorizontalScroll } from "../../components/HorizontalScroll";
import { LandingCardComponent } from "../../components/LandingCardComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { IdentityProvider } from "../../models/IdentityProvider";
import ROUTES from "../../navigation/routes";
import {
  idpSelected,
  resetAuthenticationState
} from "../../store/actions/authentication";
import { Dispatch } from "../../store/actions/types";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import {
  hasApiLevelSupportSelector,
  hasNFCFeatureSelector,
  isCieSupportedSelector
} from "../../store/reducers/cie";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { ComponentProps } from "../../types/react";
import { isDevEnv } from "../../utils/environment";
import { showToast } from "../../utils/showToast";

type Props = NavigationInjectedProps &
  LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const getCards = (
  isCIEAvailable: boolean
): ReadonlyArray<ComponentProps<typeof LandingCardComponent>> => [
  {
    id: 5,
    image: require("../../../img/landing/05.png"),
    title: I18n.t("authentication.landing.card5-title"),
    content: I18n.t("authentication.landing.card5-content")
  },
  {
    id: 1,
    image: require("../../../img/landing/01.png"),
    title: I18n.t("authentication.landing.card1-title"),
    content: I18n.t("authentication.landing.card1-content")
  },
  {
    id: 2,
    image: require("../../../img/landing/02.png"),
    title: I18n.t("authentication.landing.card2-title"),
    content: I18n.t("authentication.landing.card2-content")
  },
  {
    id: 3,
    image: require("../../../img/landing/03.png"),
    title: I18n.t("authentication.landing.card3-title"),
    content: I18n.t("authentication.landing.card3-content")
  },
  {
    id: 4,
    image: isCIEAvailable
      ? require("../../../img/cie/CIE-onboarding-illustration.png")
      : require("../../../img/landing/04.png"),
    title: isCIEAvailable
      ? I18n.t("authentication.landing.loginSpidCie")
      : I18n.t("authentication.landing.card4-title"),
    content: isCIEAvailable
      ? I18n.t("authentication.landing.loginSpidCieContent")
      : I18n.t("authentication.landing.card4-content")
  }
];

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.landing.contextualHelpTitle",
  body: "authentication.landing.contextualHelpContent"
};

const styles = StyleSheet.create({
  noPadded: {
    paddingLeft: 0,
    paddingRight: 0
  },
  flex: {
    flex: 1
  },
  noCie: {
    opacity: 0.35
  },
  checkboxBackground: {
    backgroundColor: "#0073E6"
  }
});

const IdpCIE: IdentityProvider = {
  id: "cie",
  name: "CIE",
  logo: "",
  entityID: "cieid",
  profileUrl: ""
};

class LandingScreen extends React.PureComponent<Props> {
  public componentDidMount() {
    if (this.props.isSessionExpired) {
      showToast(
        I18n.t("authentication.expiredSessionBanner.message"),
        "warning",
        "top"
      );
      this.props.resetState();
    }

    if (this.props.isSessionExpired) {
      showToast(
        I18n.t("authentication.expiredSessionBanner.message"),
        "warning",
        "top"
      );
    }
  }

  private renderAndroidConditions = () => {
    return (
      <React.Fragment>
        <View spacer={true} />
        <Markdown>
          {I18n.t("authentication.landing.cie_unsupported.android_desc")}
        </Markdown>
        <View spacer={true} extralarge={true} />
        <List>
          <ListItem>
            <IconFont
              name="io-tick-big"
              size={16}
              color={
                this.props.hasCieApiLevelSupport
                  ? customVariables.brandLightGray
                  : customVariables.contentPrimaryBackground
              }
            />
            <Body>
              <Text>
                {I18n.t(
                  "authentication.landing.cie_unsupported.os_version_unsupported"
                )}
              </Text>
            </Body>
          </ListItem>
          <ListItem>
            <IconFont
              name="io-tick-big"
              size={16}
              color={
                this.props.hasCieNFCFeature
                  ? customVariables.brandLightGray
                  : customVariables.contentPrimaryBackground
              }
            />
            <Body>
              <Text>
                {I18n.t(
                  "authentication.landing.cie_unsupported.nfc_incompatible"
                )}
              </Text>
            </Body>
          </ListItem>
        </List>
      </React.Fragment>
    );
  };

  private openUnsupportedCIEModal = () => {
    this.props.showAnimatedModal(
      <ContextualHelp
        onClose={this.props.hideModal}
        title={I18n.t("authentication.landing.cie_unsupported.title")}
        body={() => (
          <React.Fragment>
            <Markdown>
              {I18n.t("authentication.landing.cie_unsupported.body")}
            </Markdown>
            {Platform.OS === "android" && this.renderAndroidConditions()}
          </React.Fragment>
        )}
      />
    );
  };

  private navigateToMarkdown = () =>
    this.props.navigation.navigate(ROUTES.MARKDOWN);

  private navigateToIdpSelection = () =>
    this.props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);

  private navigateToCiePinScreen = () => {
    if (this.props.isCieSupported) {
      this.props.dispatchIdpCieSelected();
      this.props.navigation.navigate(ROUTES.CIE_PIN_SCREEN);
    } else {
      this.openUnsupportedCIEModal();
    }
  };

  private navigateToSpidCieInformationRequest = () =>
    this.props.navigation.navigate(
      this.props.isCieSupported
        ? ROUTES.AUTHENTICATION_SPID_CIE_INFORMATION
        : ROUTES.AUTHENTICATION_SPID_INFORMATION
    );

  private renderCardComponents = () => {
    const cardProps = getCards(this.props.isCieSupported);
    return cardProps.map(p => (
      <LandingCardComponent key={`card-${p.id}`} {...p} />
    ));
  };

  public render() {
    return (
      <BaseScreenComponent
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={
          this.props.isCieSupported
            ? ["landing_SPID", "landing_CIE"]
            : ["landing_SPID"]
        }
      >
        {isDevEnv && <DevScreenButton onPress={this.navigateToMarkdown} />}

        <Content contentContainerStyle={styles.flex} noPadded={true}>
          <HorizontalScroll cards={this.renderCardComponents()} />
        </Content>

        <View footer={true}>
          <ButtonDefaultOpacity
            style={!this.props.isCieSupported ? styles.noCie : undefined}
            block={true}
            primary={true}
            iconLeft={true}
            onPress={this.navigateToCiePinScreen}
            testID={"landing-button-login-cie"}
          >
            <IconFont name={"io-cie"} color={variables.colorWhite} />
            <Text>{I18n.t("authentication.landing.loginCie")}</Text>
          </ButtonDefaultOpacity>
          <View spacer={true} />
          <ButtonDefaultOpacity
            block={true}
            primary={true}
            iconLeft={true}
            onPress={this.navigateToIdpSelection}
            testID={"landing-button-login-spid"}
          >
            <IconFont name={"io-profilo"} color={variables.colorWhite} />
            <Text>{I18n.t("authentication.landing.loginSpid")}</Text>
          </ButtonDefaultOpacity>
          <View spacer={true} />
          <ButtonDefaultOpacity
            block={true}
            small={true}
            transparent={true}
            onPress={this.navigateToSpidCieInformationRequest}
          >
            <Text style={styles.noPadded}>
              {this.props.isCieSupported
                ? I18n.t("authentication.landing.nospid-nocie")
                : I18n.t("authentication.landing.nospid")}
            </Text>
          </ButtonDefaultOpacity>
        </View>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isCIEAuthenticationSupported = isCieSupportedSelector(state);
  const hasApiLevelSupport = hasApiLevelSupportSelector(state);
  const hasNFCFeature = hasNFCFeatureSelector(state);
  return {
    isSessionExpired: isSessionExpiredSelector(state),
    isCieSupported: pot.getOrElse(isCIEAuthenticationSupported, false),
    hasCieApiLevelSupport: pot.getOrElse(hasApiLevelSupport, false),
    hasCieNFCFeature: pot.getOrElse(hasNFCFeature, false)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetState: () => dispatch(resetAuthenticationState()),
  dispatchIdpCieSelected: () => dispatch(idpSelected(IdpCIE))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(LandingScreen));

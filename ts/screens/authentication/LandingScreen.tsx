/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import JailMonkey from "jail-monkey";
import { Content, Text as NBText } from "native-base";
import * as React from "react";
import { View, Alert, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { connect } from "react-redux";
import sessionExpiredImg from "../../../img/landing/session_expired.png";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import CieNotSupported from "../../components/cie/CieNotSupported";
import ContextualInfo from "../../components/ContextualInfo";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Link } from "../../components/core/typography/Link";
import { IOColors } from "../../components/core/variables/IOColors";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { DevScreenButton } from "../../components/DevScreenButton";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { HorizontalScroll } from "../../components/HorizontalScroll";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import { LandingCardComponent } from "../../components/LandingCardComponent";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import { mixpanelTrack } from "../../mixpanel";
import { IdentityProvider } from "../../models/IdentityProvider";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import {
  idpSelected,
  resetAuthenticationState
} from "../../store/actions/authentication";
import { continueWithRootOrJailbreak } from "../../store/actions/persistedPreferences";
import { Dispatch } from "../../store/actions/types";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import {
  hasApiLevelSupportSelector,
  hasNFCFeatureSelector,
  isCieSupportedSelector
} from "../../store/reducers/cie";
import { continueWithRootOrJailbreakSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { ComponentProps } from "../../types/react";
import { isDevEnv } from "../../utils/environment";
import RootedDeviceModal from "../modal/RootedDeviceModal";
import { Icon } from "../../components/core/icons";

type NavigationProps = IOStackNavigationRouteProps<AppParamsList, "INGRESS">;

type Props = NavigationProps &
  LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  isRootedOrJailbroken: O.Option<boolean>;
  isSessionExpired: boolean;
};

const getCards = (
  isCIEAvailable: boolean
): ReadonlyArray<ComponentProps<typeof LandingCardComponent>> => [
  {
    id: 5,
    image: require("../../../img/landing/05.png"),
    title: I18n.t("authentication.landing.card5-title"),
    content: I18n.t("authentication.landing.card5-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.accessibility.carousel.label"
    )}. ${I18n.t("authentication.landing.card5-title")}. ${I18n.t(
      "authentication.landing.card5-content-accessibility"
    )}`,
    accessibilityHint: I18n.t(
      "authentication.landing.accessibility.carousel.hint"
    )
  },
  {
    id: 1,
    image: require("../../../img/landing/01.png"),
    title: I18n.t("authentication.landing.card1-title"),
    content: I18n.t("authentication.landing.card1-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card1-title"
    )}. ${I18n.t("authentication.landing.card1-content")}`
  },
  {
    id: 2,
    image: require("../../../img/landing/02.png"),
    title: I18n.t("authentication.landing.card2-title"),
    content: I18n.t("authentication.landing.card2-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card2-title"
    )}. ${I18n.t("authentication.landing.card2-content")}`
  },
  {
    id: 3,
    image: require("../../../img/landing/03.png"),
    title: I18n.t("authentication.landing.card3-title"),
    content: I18n.t("authentication.landing.card3-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card3-title"
    )}. ${I18n.t("authentication.landing.card3-content")}`
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
      : I18n.t("authentication.landing.card4-content"),
    accessibilityLabel: `${I18n.t(
      "authentication.landing.card4-title"
    )}. ${I18n.t("authentication.landing.card4-content")}`
  }
];

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.landing.contextualHelpTitle",
  body: "authentication.landing.contextualHelpContent"
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  noCie: {
    // don't use opacity since the button still have the active color when it is pressed
    // TODO: Remove this half-disabled state.
    // See also discusssion on Slack: https://pagopaspa.slack.com/archives/C012L0U4NQL/p1657171504522639
    backgroundColor: IOColors.noCieButton
  },
  fullOpacity: {
    backgroundColor: variables.brandPrimary
  },
  link: {
    textAlign: "center",
    paddingBottom: 5,
    paddingTop: 4.5,
    lineHeight: 30
  }
});

export const IdpCIE: IdentityProvider = {
  id: "cie",
  name: "CIE",
  logo: "",
  entityID: "cieid",
  profileUrl: ""
};

class LandingScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isRootedOrJailbroken: O.none, isSessionExpired: false };
  }

  private isCieSupported = () => this.props.isCieSupported;

  public async componentDidMount() {
    const isRootedOrJailbroken = await JailMonkey.isJailBroken();
    this.setState({ isRootedOrJailbroken: O.some(isRootedOrJailbroken) });
    if (this.props.isSessionExpired) {
      this.setState({ isSessionExpired: true });
      this.props.resetState();
    }
  }

  private displayTabletAlert() {
    Alert.alert(
      "",
      I18n.t("tablet.message"),
      [
        {
          text: I18n.t("global.buttons.continue"),
          style: "cancel"
        }
      ],
      { cancelable: true }
    );
  }

  private openUnsupportedCIEModal = () => {
    this.props.showAnimatedModal(
      <ContextualInfo
        onClose={this.props.hideModal}
        title={I18n.t("authentication.landing.cie_unsupported.title")}
        body={() => (
          <CieNotSupported
            hasCieApiLevelSupport={this.props.hasCieApiLevelSupport}
            hasCieNFCFeature={this.props.hasCieNFCFeature}
          />
        )}
      />
    );
  };

  private navigateToMarkdown = () =>
    this.props.navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.MARKDOWN
    });

  private navigateToIdpSelection = () =>
    this.props.navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_IDP_SELECTION
    });

  private navigateToCiePinScreen = () => {
    if (this.isCieSupported()) {
      this.props.dispatchIdpCieSelected();
      this.props.navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.CIE_PIN_SCREEN
      });
    } else {
      this.openUnsupportedCIEModal();
    }
  };

  private navigateToSpidCieInformationRequest = () =>
    this.props.navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: this.isCieSupported()
        ? ROUTES.AUTHENTICATION_SPID_CIE_INFORMATION
        : ROUTES.AUTHENTICATION_SPID_INFORMATION
    });

  private renderCardComponents = () => {
    const cardProps = getCards(this.isCieSupported());
    return cardProps.map(p => (
      <LandingCardComponent key={`card-${p.id}`} {...p} />
    ));
  };

  private handleContinueWithRootOrJailbreak = (continueWith: boolean) => {
    this.props.dispatchContinueWithRootOrJailbreak(continueWith);
  };

  private renderLandingScreen = () => {
    const isCieSupported = this.isCieSupported();
    const secondButtonStyle = isCieSupported
      ? styles.fullOpacity
      : styles.noCie;
    return (
      <BaseScreenComponent
        appLogo
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={
          isCieSupported ? ["landing_SPID", "landing_CIE"] : ["landing_SPID"]
        }
      >
        {isDevEnv && <DevScreenButton onPress={this.navigateToMarkdown} />}

        {this.state.isSessionExpired ? (
          <InfoScreenComponent
            title={I18n.t("authentication.landing.session_expired.title")}
            body={I18n.t("authentication.landing.session_expired.body")}
            image={renderInfoRasterImage(sessionExpiredImg)}
          />
        ) : (
          <Content contentContainerStyle={styles.flex} noPadded={true}>
            <HorizontalScroll cards={this.renderCardComponents()} />
          </Content>
        )}

        <SectionStatusComponent sectionKey={"login"} />
        <View style={IOStyles.footer}>
          <ButtonDefaultOpacity
            block={true}
            primary={true}
            iconLeft={true}
            onPress={
              isCieSupported
                ? this.navigateToCiePinScreen
                : this.navigateToIdpSelection
            }
            accessibilityRole="button"
            accessible={true}
            accessibilityLabel={
              isCieSupported
                ? I18n.t("authentication.landing.loginCie")
                : I18n.t("authentication.landing.loginSpid")
            }
            testID={
              isCieSupported
                ? "landing-button-login-cie"
                : "landing-button-login-spid"
            }
          >
            <Icon name={isCieSupported ? "cie" : "navProfile"} color="white" />
            <NBText>
              {isCieSupported
                ? I18n.t("authentication.landing.loginCie")
                : I18n.t("authentication.landing.loginSpid")}
            </NBText>
          </ButtonDefaultOpacity>
          <VSpacer size={16} />
          <ButtonDefaultOpacity
            accessibilityLabel={
              this.isCieSupported()
                ? I18n.t("authentication.landing.loginSpid")
                : I18n.t("authentication.landing.loginCie")
            }
            accessibilityRole="button"
            accessible={true}
            style={secondButtonStyle}
            block={true}
            primary={true}
            iconLeft={true}
            onPress={
              this.isCieSupported()
                ? this.navigateToIdpSelection
                : this.navigateToCiePinScreen
            }
            testID={
              this.isCieSupported()
                ? "landing-button-login-spid"
                : "landing-button-login-cie"
            }
          >
            <Icon
              name={this.isCieSupported() ? "navProfile" : "cie"}
              color="white"
            />
            <NBText>
              {this.isCieSupported()
                ? I18n.t("authentication.landing.loginSpid")
                : I18n.t("authentication.landing.loginCie")}
            </NBText>
          </ButtonDefaultOpacity>
          <VSpacer size={16} />
          <Link
            style={styles.link}
            onPress={this.navigateToSpidCieInformationRequest}
          >
            {this.isCieSupported()
              ? I18n.t("authentication.landing.nospid-nocie")
              : I18n.t("authentication.landing.nospid")}
          </Link>
        </View>
      </BaseScreenComponent>
    );
  };

  // Screen displayed during the async loading of the JailMonkey.isJailBroken()
  private renderLoadingScreen = () => (
    <View style={{ flex: 1 }}>
      <LoadingSpinnerOverlay isLoading={true} />
    </View>
  );

  private chooseScreenToRender = (isRootedOrJailbroken: boolean) => {
    // if the device is compromised and the user didn't allow to continue
    // show a blocking modal
    if (isRootedOrJailbroken && !this.props.continueWithRootOrJailbreak) {
      void mixpanelTrack("SHOW_ROOTED_OR_JAILBROKEN_MODAL");
      return (
        <RootedDeviceModal
          onContinue={() => this.handleContinueWithRootOrJailbreak(true)}
          onCancel={() => this.handleContinueWithRootOrJailbreak(false)}
        />
      );
    }
    // In case of Tablet, display an alert to inform the user
    if (DeviceInfo.isTablet()) {
      this.displayTabletAlert();
    }
    // standard rendering of the landing screen
    return this.renderLandingScreen();
  };

  public render() {
    // If the async loading of the isRootedOrJailbroken is not ready, display a loading
    return pipe(
      this.state.isRootedOrJailbroken,
      O.fold(
        () => this.renderLoadingScreen(),
        // when the value isRootedOrJailbroken is ready, display the right screen based on a set of rule
        rootedOrJailbroken => this.chooseScreenToRender(rootedOrJailbroken)
      )
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isCIEAuthenticationSupported = isCieSupportedSelector(state);
  const hasApiLevelSupport = hasApiLevelSupportSelector(state);
  const hasNFCFeature = hasNFCFeatureSelector(state);
  return {
    isSessionExpired: isSessionExpiredSelector(state),
    continueWithRootOrJailbreak: continueWithRootOrJailbreakSelector(state),
    isCieSupported: pot.getOrElse(isCIEAuthenticationSupported, false),
    hasCieApiLevelSupport: pot.getOrElse(hasApiLevelSupport, false),
    hasCieNFCFeature: pot.getOrElse(hasNFCFeature, false)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetState: () => dispatch(resetAuthenticationState()),
  dispatchIdpCieSelected: () => dispatch(idpSelected(IdpCIE)),
  dispatchContinueWithRootOrJailbreak: (continueWith: boolean) =>
    dispatch(continueWithRootOrJailbreak(continueWith))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(LandingScreen));

/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */

import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { DevScreenButton } from "../../components/DevScreenButton";
import { HorizontalScroll } from "../../components/HorizontalScroll";
import { LandingCardComponent } from "../../components/LandingCardComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import { isDevEnvironment } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import variables from "../../theme/variables";
import { ComponentProps } from "../../types/react";

import { isCIEAuthenticationSupported, isNfcEnabled } from "../../utils/cie";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps;
type State = {
  isCIEAuthenticationSupported: boolean;
  isNfcEnabled: boolean;
};

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
      ? require("../../../img/landing/CIE-onboarding-illustration.png")
      : require("../../../img/landing/04.png"),
    title: isCIEAvailable
      ? I18n.t("authentication.landing.loginSpidCie")
      : I18n.t("authentication.landing.card4-title"),
    content: isCIEAvailable
      ? I18n.t("authentication.landing.loginSpidCieContent")
      : I18n.t("authentication.landing.card4-content")
  }
];

class LandingScreen extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { isCIEAuthenticationSupported: false, isNfcEnabled: false };
  }

  public async componentDidMount() {
    const isCieSupported = await isCIEAuthenticationSupported();
    const isNfcOn = await isNfcEnabled();
    this.setState({
      isCIEAuthenticationSupported: isCieSupported,
      isNfcEnabled: isNfcOn
    });
  }

  private navigateToMarkdown = () =>
    this.props.navigation.navigate(ROUTES.MARKDOWN);
  private navigateToIdpSelection = () =>
    this.props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);

  private navigateToCiePinScreen = () => {
    this.props.navigation.navigate(
      this.state.isNfcEnabled
        ? ROUTES.CIE_PIN_SCREEN
        : ROUTES.CIE_EXPIRED_SCREEN
    );
  };

  private navigateToSpidCieInformationRequest = () =>
    this.state.isCIEAuthenticationSupported
      ? this.props.navigation.navigate(
          ROUTES.AUTHENTICATION_SPID_CIE_INFORMATION
        )
      : this.props.navigation.navigate(ROUTES.AUTHENTICATION_SPID_INFORMATION);

  private renderCardComponents = () => {
    const cardProps = getCards(this.state.isCIEAuthenticationSupported);
    return cardProps.map(p => (
      <LandingCardComponent key={`card-${p.id}`} {...p} />
    ));
  };

  public render() {
    return (
      <BaseScreenComponent>
        {isDevEnvironment() && (
          <DevScreenButton onPress={this.navigateToMarkdown} />
        )}

        <Content contentContainerStyle={{ flex: 1 }} noPadded={true}>
          <View spacer={true} large={true} />
          <HorizontalScroll cards={this.renderCardComponents()} />
          <View spacer={true} />
        </Content>

        <View footer={true}>
          {this.state.isCIEAuthenticationSupported && (
            <Button
              block={true}
              primary={true}
              iconLeft={true}
              onPress={this.navigateToCiePinScreen}
              testID={"landing-button-login-cie"}
            >
              <IconFont name={"io-cie"} color={variables.colorWhite} />
              <Text>{I18n.t("authentication.landing.loginCie")}</Text>
            </Button>
          )}
          <View spacer={true} />
          <Button
            block={true}
            primary={true}
            iconLeft={true}
            onPress={this.navigateToIdpSelection}
            testID={"landing-button-login-spid"}
          >
            <IconFont name={"io-profilo"} color={variables.colorWhite} />
            <Text>{I18n.t("authentication.landing.loginSpid")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            small={true}
            transparent={true}
            onPress={this.navigateToSpidCieInformationRequest}
          >
            <Text>
              {this.state.isCIEAuthenticationSupported
                ? I18n.t("authentication.landing.nospid-nocie")
                : I18n.t("authentication.landing.nospid")}
            </Text>
          </Button>
          <View spacer={true} extralarge={true} />
        </View>
      </BaseScreenComponent>
    );
  }
}

export default connect()(LandingScreen);

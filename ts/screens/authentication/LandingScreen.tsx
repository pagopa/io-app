/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */

import { Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { DevScreenButton } from "../../components/DevScreenButton";
import { HorizontalScroll } from "../../components/HorizontalScroll";
import { LandingCardComponent } from "../../components/LandingCardComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import { isCIEauthenticationEnabled, isDevEnvironment } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { ComponentProps } from "../../types/react";
import { showToast } from "../../utils/showToast";
import * as config from "../../config";

type Props = ReduxProps &
  ReturnType<typeof mapStateToProps> &
  NavigationScreenProps;
const isCIEAuthenticationSupported = false; // TODO: waiting for sdk cie implementation https://www.pivotaltracker.com/story/show/169730204
const isCIEAvailable =
  isCIEAuthenticationSupported && isCIEauthenticationEnabled;

const cardProps: ReadonlyArray<ComponentProps<typeof LandingCardComponent>> = [
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

const cardComponents = cardProps.map(p => (
  <LandingCardComponent key={`card-${p.id}`} {...p} />
));

class LandingScreen extends React.PureComponent<Props> {
  private navigateToMarkdown = () =>
    this.props.navigation.navigate(ROUTES.MARKDOWN);
  private navigateToIdpSelection = () =>
    this.props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);
  private navigateToSpidCieInformationRequest = () =>
    config.isCIEauthenticationEnabled
      ? this.props.navigation.navigate(ROUTES.AUTHENTICATION_SPID_CIE_INFORMATION)
      : this.props.navigation.navigate(ROUTES.AUTHENTICATION_SPID_INFORMATION);

  public componentDidMount() {
    if (this.props.isSessionExpired) {
      showToast(
        I18n.t("authentication.expiredSessionBanner.message"),
        "warning",
        "top"
      );
    }
  }

  public render() {
    return (
      <BaseScreenComponent>
        {isDevEnvironment() && (
          <DevScreenButton onPress={this.navigateToMarkdown} />
        )}

        <Content contentContainerStyle={{ flex: 1 }} noPadded={true}>
          <View spacer={true} large={true} />
          <HorizontalScroll cards={cardComponents} />
          <View spacer={true} />
        </Content>

      <View footer={true}>
        {isCIEAvailable && (
          <ButtonDefaultOpacity
            block={true}
            primary={true}
            iconLeft={true}
            onPress={this.navigateToIdpSelection}
            testID={"landing-button-login"}
          >
            <IconFont name={"io-cie"} color={variables.colorWhite} />
            <Text>{I18n.t("authentication.landing.loginCie")}</Text>
          </ButtonDefaultOpacity>
        )}
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
          <Text>
            {isCIEAvailable
              ? I18n.t("authentication.landing.nospid-nocie")
              : I18n.t("authentication.landing.nospid")}
          </Text>
        </ButtonDefaultOpacity>
        <View spacer={true} extralarge={true} />
      </View>
    </BaseScreenComponent>
  );
};
}

const mapStateToProps = (state: GlobalState) => ({
  isSessionExpired: isSessionExpiredSelector(state)
});

export default connect(mapStateToProps)(LandingScreen);

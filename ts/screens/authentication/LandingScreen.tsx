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
import { isCIEauthenticationEnabled, isDevEnvironment } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import variables from "../../theme/variables";
import { ComponentProps } from "../../types/react";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps;
const isCIEAuthenticationSupported = false; // TODO: waiting for sdk cie implementation
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

const LandingScreen: React.SFC<Props> = props => {
  const navigateToMarkdown = () => props.navigation.navigate(ROUTES.MARKDOWN);
  const navigateToIdpSelection = () =>
    props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);

  const navigateToSpidInformationRequest = () =>
    props.navigation.navigate(ROUTES.AUTHENTICATION_SPID_INFORMATION);

  const cardComponents = cardProps.map(p => (
    <LandingCardComponent key={`card-${p.id}`} {...p} />
  ));

  return (
    <BaseScreenComponent>
      {isDevEnvironment() && <DevScreenButton onPress={navigateToMarkdown} />}

      <Content contentContainerStyle={{ flex: 1 }} noPadded={true}>
        <View spacer={true} large={true} />
        <HorizontalScroll cards={cardComponents} />
        <View spacer={true} />
      </Content>

      <View footer={true}>
        {isCIEAvailable && (
          <Button
            block={true}
            primary={true}
            iconLeft={true}
            onPress={undefined} // TODO: here navigate to identity card check
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
          onPress={navigateToIdpSelection}
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
          onPress={navigateToSpidInformationRequest}
        >
          <Text>
            {isCIEAvailable
              ? I18n.t("authentication.landing.nospid-nocie")
              : I18n.t("authentication.landing.nospid")}
          </Text>
        </Button>
        <View spacer={true} extralarge={true} />
      </View>
    </BaseScreenComponent>
  );
};

export default connect()(LandingScreen);

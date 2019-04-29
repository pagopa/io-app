/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */

import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { HorizontalScroll } from "../../components/HorizontalScroll";
import { LandingCardComponent } from "../../components/LandingCard";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";

import { isDevEnvironment } from "../../config";

import I18n from "../../i18n";

import ROUTES from "../../navigation/routes";

import { ReduxProps } from "../../store/actions/types";

import variables from "../../theme/variables";

import { ComponentProps } from "../../types/react";

import { addSeconds } from "date-fns";
import PushNotification from "react-native-push-notification";
import { DevScreenButton } from "../../components/DevScreenButton";
import { LOCAL_NOTIFICATION_FIRST_ACCESS_SPID_ID } from "../../utils/constants";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps;

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
    image: require("../../../img/landing/04.png"),
    title: I18n.t("authentication.landing.card4-title"),
    content: I18n.t("authentication.landing.card4-content")
  }
];

/*
 * Schedule a local notification to remind the user to authenticate with spid
 */
function configureLocalNotificationForFirstAccessSpid() {
  const nowDate = new Date();
  const scheduledDate = addSeconds(nowDate, 20);

  PushNotification.localNotificationSchedule({
    title: "My Notification Title",
    message: "My Notification Message",
    date: scheduledDate,
    id: LOCAL_NOTIFICATION_FIRST_ACCESS_SPID_ID
  });
}

const LandingScreen: React.SFC<Props> = props => {
  const navigateToMarkdown = () => props.navigation.navigate(ROUTES.MARKDOWN);
  const navigateToIdpSelection = () =>
    props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);

  const navigateToSpidInformationRequest = () =>
    props.navigation.navigate(ROUTES.AUTHENTICATION_SPID_INFORMATION);

  const cardComponents = cardProps.map(p => (
    <LandingCardComponent key={`card-${p.id}`} {...p} />
  ));

  configureLocalNotificationForFirstAccessSpid();

  return (
    <BaseScreenComponent>
      {isDevEnvironment() && <DevScreenButton onPress={navigateToMarkdown} />}

      <Content contentContainerStyle={{ flex: 1 }} noPadded={true}>
        <View spacer={true} large={true} />
        <HorizontalScroll cards={cardComponents} />
        <View spacer={true} />
      </Content>

      <View footer={true}>
        <Button
          block={true}
          primary={true}
          iconLeft={true}
          onPress={navigateToIdpSelection}
          testID="landing-button-login"
        >
          <IconFont name="io-profilo" color={variables.colorWhite} />
          <Text>{I18n.t("authentication.landing.login")}</Text>
        </Button>
        <View spacer={true} />
        <Button
          block={true}
          small={true}
          transparent={true}
          onPress={navigateToSpidInformationRequest}
        >
          <Text>{I18n.t("authentication.landing.nospid")}</Text>
        </Button>
      </View>
    </BaseScreenComponent>
  );
};

export default connect()(LandingScreen);

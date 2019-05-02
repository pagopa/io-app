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

import { addMinutes } from "date-fns";
import PushNotification from "react-native-push-notification";
import { DevScreenButton } from "../../components/DevScreenButton";
import { LOCAL_NOTIFICATION_FIRST_ACCESS_SPID_ID_TAG } from "../../utils/constants";

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
 * Schedule a set of local notifications to remind the user to authenticate with spid
 */
function configureLocalNotificationForFirstAccessSpid() {
  const nowDate = new Date();
  // Configure the dates to schedule local notifications
  const oneDayDate = addMinutes(nowDate, 1);
  const threeDayDate = addMinutes(oneDayDate, 1);
  const oneWeekDate = addMinutes(threeDayDate, 1);
  const twoWeekDate = addMinutes(oneWeekDate, 1);
  const oneMonthDate = addMinutes(twoWeekDate, 1);
  const twoMonthDate = addMinutes(oneMonthDate, 1);
  const sixMonthDate = addMinutes(twoMonthDate, 1);
  const localNotificationDates: ReadonlyArray<Date> = [
    oneDayDate,
    threeDayDate,
    oneWeekDate,
    twoWeekDate,
    oneMonthDate,
    twoMonthDate,
    sixMonthDate
  ];

  localNotificationDates.forEach((scheduledDate: Date) =>
    PushNotification.localNotificationSchedule({
      title: I18n.t("global.localNotifications.spidLogin.title"),
      message: I18n.t("global.localNotifications.spidLogin.message"),
      date: scheduledDate,
      tag: LOCAL_NOTIFICATION_FIRST_ACCESS_SPID_ID_TAG
    })
  );
}

class LandingScreen extends React.Component<Props> {
  public componentDidMount() {
    configureLocalNotificationForFirstAccessSpid();
  }

  public render() {
    const { navigation } = this.props;

    const navigateToMarkdown = () => {
      navigation.navigate(ROUTES.MARKDOWN);
    };
    const navigateToIdpSelection = () => {
      navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);
    };

    const navigateToSpidInformationRequest = () => {
      navigation.navigate(ROUTES.AUTHENTICATION_SPID_INFORMATION);
    };

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
  }
}

export default connect()(LandingScreen);

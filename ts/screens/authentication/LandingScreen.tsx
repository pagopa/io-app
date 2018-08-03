/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */

import { Body, Button, Container, Content, Text, View } from "native-base";
import * as React from "react";
import { Animated, Dimensions, Image, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { Col } from "react-native-easy-grid";
import { Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { HorizontalScroll } from "../../components/HorizontalScroll";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import { environment } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import variables from "../../theme/variables";

type ReduxMappedProps = {};
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};
type Props = ReduxMappedProps & ReduxProps & OwnProps;

export type landingCardType = {
  id: number;
  image: NodeRequire;
  title: string;
  content: string;
};

const cards: ReadonlyArray<landingCardType> = [
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

const screenWidth = Dimensions.get("screen").width;
const BAR_SPACE = 10;

const styles = StyleSheet.create({
  card: {
    width: screenWidth,
    alignItems: "center",
    alignContent: "flex-start"
  },
  image: {
    width: screenWidth / 2,
    height: screenWidth / 2,
    resizeMode: "contain"
  }
});

class LandingScreen extends React.Component<Props, never> {
  public numItems = cards.length;
  public itemWidth = BAR_SPACE;
  public animVal = new Animated.Value(0);

  private navigateToMarkdown() {
    this.props.navigation.navigate(ROUTES.MARKDOWN);
  }

  private navigateToIdpSelection() {
    this.props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);
  }

  private navigateToSpidInformationRequest() {
    this.props.navigation.navigate(ROUTES.AUTHENTICATION_SPID_INFORMATION);
  }

  private getCardArray() {
    const cardArray: ReadonlyArray<JSX.Element> = [];
    cards.forEach((card, i) => {
      const thisCard = (
        <View key={`card${i}`} style={styles.card}>
          <Image source={card.image} style={styles.image} />
          <View spacer={true} />
          <Grid>
            <Col size={1} />
            <Col size={7}>
              <Text bold={true} alignCenter={true}>
                {" "}
                {card.title}{" "}
              </Text>
              <View spacer={true} />
              <Text alignCenter={true}> {card.content} </Text>
              <View spacer={true} />
            </Col>
            <Col size={1} />
          </Grid>
        </View>
      );
      cardArray.push(thisCard);
    });
    return cardArray;
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{DeviceInfo.getApplicationName()}</Text>
          </Body>
        </AppHeader>
        <Content noPadded={true}>
          {environment === "DEV" && (
            <Text link={true} onPress={_ => this.navigateToMarkdown()}>
              Test Markdown
            </Text>
          )}

          <HorizontalScroll
            cardsContent={cards}
            cardsArray={this.getCardArray()}
          />
        </Content>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            iconLeft={true}
            onPress={_ => this.navigateToIdpSelection()}
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
            onPress={_ => this.navigateToSpidInformationRequest()}
          >
            <Text>{I18n.t("authentication.landing.nospid")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
export default connect()(LandingScreen);

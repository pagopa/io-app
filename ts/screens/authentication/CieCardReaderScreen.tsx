import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import AnimatedCircularProgress from "../../components/animations/AnimatedCircularProgress";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}

type Props = OwnProps;
// Image dimension
const imgDimension = 180;

const styles = StyleSheet.create({
  messageHeader: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding / 2,
    fontSize: customVariables.fontSizeBase
  },
  messageFooter: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding / 2,
    fontSize: customVariables.fontSizeBase
  },
  titleHeader: {
    marginTop: 35
  },
  imgContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  img: {
    overflow: "hidden",
    backgroundColor: customVariables.colorWhite,
    height: imgDimension - 3,
    width: imgDimension - 3,
    borderRadius: imgDimension / 2
  }
});

/**
 *  This screen shown while reading the card
 */
const CieCardReaderScreen: React.SFC<Props> = props => {
  // With the AnimatedCircularProgress component we can represent a circular progress
  return (
    <BaseScreenComponent goBack={true}>
      <Content noPadded={true} bounces={false}>
        <ScreenHeader
          heading={
            <H2 style={styles.titleHeader}>
              {I18n.t("authentication.cie.readerCardTitle")}
            </H2>
          }
        />
        <Text style={styles.messageHeader}>
          {I18n.t("authentication.cie.readerCardHeader")}
        </Text>
        <View style={styles.imgContainer}>
          <AnimatedCircularProgress
            dimension={imgDimension}
            duration={3000 as Millisecond}
          />
          <Image
            source={require("../../../img/landing/place-card-illustration.png")}
            style={styles.img}
          />
        </View>
        <Text style={styles.messageFooter}>
          {I18n.t("authentication.cie.readerCardFooter")}
        </Text>
      </Content>
      <View footer={true}>
        <Button onPress={props.navigation.goBack} cancel={true} block={true}>
          <Text>{I18n.t("global.buttons.cancel")}</Text>
        </Button>
      </View>
    </BaseScreenComponent>
  );
};

export default CieCardReaderScreen;

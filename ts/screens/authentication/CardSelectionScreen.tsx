import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import AnimatedRing from "../../components/animations/AnimatedRing";
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
const boxDimension = 245;
const ringDimensionMin = imgDimension;

const styles = StyleSheet.create({
  messageHeader: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding,
    fontSize: customVariables.fontSizeBase
  },
  messageFooter: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding,
    fontSize: customVariables.fontSizeBase
  },
  img: {
    width: imgDimension,
    height: imgDimension,
    borderRadius: imgDimension / 2,
    position: "absolute",
    bottom: boxDimension / 2 - imgDimension / 2,
    overflow: "hidden"
  },
  titleHeader: {
    marginTop: 35
  }
});

const ringSettings = {
  dimension: ringDimensionMin,
  // Three different animation start delays (one is 0), one for each ring
  delayX1: 700 as Millisecond,
  delayX2: 1400 as Millisecond,
  duration: 2100 as Millisecond
};

/**
 *  This screen drives the user through the using of the CIE card interacting with the NFC
 */
const CardSelectionScreen: React.SFC<Props> = props => {
  return (
    // With the following animation we can represent 3 circles that light up similar to a 'radar' effect
    <BaseScreenComponent goBack={true}>
      <Content noPadded={true} bounces={false}>
        <ScreenHeader
          heading={
            <H2 style={styles.titleHeader}>
              {I18n.t("authentication.cie.card.title")}
            </H2>
          }
        />
        <Text style={styles.messageHeader}>
          {I18n.t("authentication.cie.card.layCardMessageHeader")}
        </Text>
        <View style={{ alignItems: "center", height: boxDimension }}>
          <AnimatedRing
            dimension={ringSettings.dimension}
            startAnimationAfter={0 as Millisecond}
            duration={ringSettings.duration}
            boxDimension={boxDimension}
          />
          <AnimatedRing
            dimension={ringSettings.dimension}
            startAnimationAfter={ringSettings.delayX1}
            duration={ringSettings.duration}
            boxDimension={boxDimension}
          />
          <AnimatedRing
            dimension={ringSettings.dimension}
            startAnimationAfter={ringSettings.delayX2}
            duration={ringSettings.duration}
            boxDimension={boxDimension}
          />

          <Image
            source={require("../../../img/cie/place-card-illustration.png")}
            style={styles.img}
          />
        </View>
        <Text style={styles.messageFooter}>
          {I18n.t("authentication.cie.card.layCardMessageFooter")}
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

export default CardSelectionScreen;

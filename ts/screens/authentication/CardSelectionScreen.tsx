import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { Button, Content, Text as NBButtonText } from "native-base";
import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import AnimatedRing from "../../components/animations/AnimatedRing";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import customVariables from "../../theme/variables";

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_CIE"
>;

// Image dimension
const imgDimension = 180;
const boxDimension = 245;
const ringDimensionMin = imgDimension;

const styles = StyleSheet.create({
  messageHeader: {
    paddingTop: customVariables.contentPadding
  },
  messageFooter: {
    paddingBottom: customVariables.contentPadding
  },
  img: {
    width: imgDimension,
    height: imgDimension,
    borderRadius: imgDimension / 2,
    position: "absolute",
    bottom: boxDimension / 2 - imgDimension / 2
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
const CardSelectionScreen: React.SFC<Props> = props => (
  // With the following animation we can represent 3 circles that light up similar to a 'radar' effect
  <BaseScreenComponent goBack={true}>
    <Content noPadded={true} bounces={false}>
      <ScreenHeader
        heading={
          <H1 style={styles.titleHeader}>
            {I18n.t("authentication.cie.card.title")}
          </H1>
        }
      />
      <View style={[IOStyles.horizontalContentPadding, styles.messageHeader]}>
        <Body>{I18n.t("authentication.cie.card.layCardMessageHeader")}</Body>
      </View>
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
      <View style={[IOStyles.horizontalContentPadding, styles.messageFooter]}>
        <Body>{I18n.t("authentication.cie.card.layCardMessageFooter")}</Body>
      </View>
    </Content>
    <View style={IOStyles.footer}>
      <Button onPress={props.navigation.goBack} cancel={true} block={true}>
        <NBButtonText>{I18n.t("global.buttons.cancel")}</NBButtonText>
      </Button>
    </View>
  </BaseScreenComponent>
);

export default CardSelectionScreen;

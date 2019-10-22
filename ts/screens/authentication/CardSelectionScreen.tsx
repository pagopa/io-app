import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import AnimatedRing from "../../components/animations/AnimatedRing";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { ReduxProps } from "../../store/actions/types";
import { isSessionExpiredSelector } from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}

type Props = ReturnType<typeof mapStateToProps> & ReduxProps & OwnProps;
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
  }
});

const ringSettings = {
  dimension: ringDimensionMin,
  duration: 2100 as Millisecond
};

/**
 * The screen where the user is guided through the use of the card with the nfc
 */
const CardSelectionScreen: React.SFC<Props> = props => {
  return (
    // With the following animation we can represent 3 circles that light up similar to a 'radar' effect
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("authentication.idp_selection.headerTitle")}
    >
      <Content noPadded={true} bounces={false}>
        <ScreenHeader
          heading={<H2 style={{ marginTop: 35 }}>{I18n.t("cie.title")}</H2>}
        />
        <Text style={styles.messageHeader}>
          {I18n.t("cie.layCardMessageHeader")}
        </Text>
        <View style={{ alignItems: "center", height: boxDimension }}>
          <AnimatedRing
            dimension={ringSettings.dimension}
            interval={0 as Millisecond}
            duration={ringSettings.duration}
            boxDimension={boxDimension}
          />
          <AnimatedRing
            dimension={ringSettings.dimension}
            interval={(ringSettings.duration / 3) as Millisecond}
            duration={ringSettings.duration}
            boxDimension={boxDimension}
          />
          <AnimatedRing
            dimension={ringSettings.dimension}
            interval={((ringSettings.duration / 3) * 2) as Millisecond}
            duration={ringSettings.duration}
            boxDimension={boxDimension}
          />

          <Image
            source={require("../../../img/landing/place-card-illustration.png")}
            style={styles.img}
          />
        </View>
        <Text style={styles.messageFooter}>
          {I18n.t("cie.layCardMessageFooter")}
        </Text>
      </Content>
      <View footer={true}>
        <Button
          onPress={() => props.navigation.goBack()}
          cancel={true}
          block={true}
        >
          <Text>{I18n.t("global.buttons.cancel")}</Text>
        </Button>
      </View>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isSessionExpired: isSessionExpiredSelector(state)
});

export default connect(mapStateToProps)(CardSelectionScreen);

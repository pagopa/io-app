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
import themeVariables from "../../theme/variables";
import customVariables from "../../theme/variables";

interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}

type Props = ReturnType<typeof mapStateToProps> & ReduxProps & OwnProps;
// Image dimension
const imgDimension = 180;
const boxDimension = 230;
const ringDimensionMin = imgDimension;

const styles = StyleSheet.create({
  description: {
    padding: customVariables.contentPadding,
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
  ring: {
    position: "absolute",
    borderWidth: 2,
    borderColor: themeVariables.brandPrimary
  },
  ringRow: {
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: themeVariables.brandPrimaryLight
  },
  ringCol: {
    alignItems: "center",
    flexDirection: "column",
    overflow: "visible",
    width: 1
  }
});

const ringSettings = {
  dimension: ringDimensionMin,
  opacity: 0.3,
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
      <Content noPadded={true} overScrollMode="never" bounces={false}>
        <ScreenHeader
          heading={<H2 style={{ marginTop: 35 }}>{I18n.t("cie.title")}</H2>}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.description}>
            {I18n.t("cie.layCardMessageA")}
          </Text>
          <View style={{ alignItems: "center", height: boxDimension }}>
            <AnimatedRing
              dimension={ringSettings.dimension}
              opacity={ringSettings.opacity}
              interval={0 as Millisecond}
              duration={ringSettings.duration}
              boxDimension={boxDimension}
            />
            <AnimatedRing
              dimension={ringSettings.dimension}
              opacity={ringSettings.opacity}
              interval={(ringSettings.duration / 3) as Millisecond}
              duration={ringSettings.duration}
              boxDimension={boxDimension}
            />
            <AnimatedRing
              dimension={ringSettings.dimension}
              opacity={ringSettings.opacity}
              interval={((ringSettings.duration / 3) * 2) as Millisecond}
              duration={ringSettings.duration}
              boxDimension={boxDimension}
            />

            <Image
              source={require("../../../img/landing/place-card-illustration.png")}
              style={styles.img}
            />
          </View>
          <Text style={styles.description}>
            {I18n.t("cie.layCardMessageB")}
          </Text>
        </View>
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

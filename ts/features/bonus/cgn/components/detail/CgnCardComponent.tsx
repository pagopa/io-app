import * as React from "react";
import { useEffect } from "react";
import WebView from "react-native-webview";
import { View, Image, ImageBackground, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../../components/core/typography/H3";
import I18n from "../../../../../i18n";
import { Card } from "../../../../../../definitions/cgn/Card";
import { GlobalState } from "../../../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import cgnLogo from "../../../../../../img/bonus/cgn/cgn_logo.png";
import eycaLogo from "../../../../../../img/bonus/cgn/eyca_logo.png";
import cardBg from "../../../../../../img/bonus/cgn/card_mask.png";
import { generateRandomSvgMovement, Point } from "../../utils/svgBackground";
import { eycaDetailSelector } from "../../store/reducers/eyca/details";
import { canEycaCardBeShown } from "../../utils/eyca";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { playSvg } from "./CardSvgPayload";
import DepartmentLabel from "./DepartmentLabel";

type Props = {
  cgnDetails: Card;
  onCardLoadEnd: () => void;
} & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  cardContainer: {
    height: "100%",
    width: widthPercentageToDP(90),
    maxWidth: 340
  },
  cgnCard: {
    position: "absolute",
    alignSelf: "center",
    width: widthPercentageToDP(90),
    maxWidth: 340,
    height: 192,
    top: 2
  },
  informationContainer: {
    width: widthPercentageToDP(90),
    maxWidth: 340,
    height: "100%",
    top: -190,
    zIndex: 9,
    elevation: 9
  },
  spaced: {
    justifyContent: "space-between"
  },
  flex1: {
    flex: 1
  },
  flex2: {
    flex: 2
  },
  paddedContentFull: {
    paddingLeft: 16,
    paddingTop: 24,
    paddingRight: 20,
    paddingBottom: 16
  },
  column: {
    flexDirection: "column"
  },
  fullLogo: {
    resizeMode: "contain",
    height: 56,
    width: 56,
    alignSelf: "flex-end"
  },
  eycaLogo: {
    resizeMode: "contain",
    height: 70,
    width: 44,
    alignSelf: "flex-end",
    marginRight: 10
  },
  imageFull: {
    resizeMode: "stretch",
    height: 215,
    width: widthPercentageToDP(95),
    maxWidth: 360,
    top: -5,
    left: -10,
    zIndex: 8
  }
});

const minPointA: Point = {
  x: 80,
  y: -100
};
const maxPointA: Point = {
  x: 100,
  y: 50
};

const minPointB: Point = {
  x: -80,
  y: 0
};
const maxPointB: Point = {
  x: 100,
  y: 10
};

const minPointC: Point = {
  x: -50,
  y: 50
};
const maxPointC: Point = {
  x: 50,
  y: 10
};

const MOVEMENT_STEPS = 12;

const CgnCardComponent: React.FunctionComponent<Props> = (props: Props) => {
  const generatedTranslationA = generateRandomSvgMovement(
    MOVEMENT_STEPS,
    minPointA,
    maxPointA
  );
  const generatedTranslationB = generateRandomSvgMovement(
    MOVEMENT_STEPS,
    minPointB,
    maxPointB
  );
  const generatedTranslationC = generateRandomSvgMovement(
    MOVEMENT_STEPS,
    minPointC,
    maxPointC
  );

  const generatedSvg = playSvg(
    generatedTranslationA,
    generatedTranslationB,
    generatedTranslationC
  );

  const canDisplayEycaLogo = canEycaCardBeShown(props.eycaDetails);

  useEffect(() => () => props.onCardLoadEnd(), []);

  return (
    <View style={styles.cgnCard} testID={"card-component"}>
      <ImageBackground
        source={cardBg}
        imageStyle={[styles.imageFull]}
        style={styles.cardContainer}
      >
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          style={{ top: -1, left: -1 }}
          testID={"background-webview"}
          onLoadEnd={props.onCardLoadEnd}
          source={{
            html: generatedSvg
          }}
        />
      </ImageBackground>
      <View style={[styles.informationContainer, styles.paddedContentFull]}>
        <View
          style={[
            IOStyles.row,
            IOStyles.flex,
            { justifyContent: "space-between" }
          ]}
        >
          <View style={[styles.column, styles.flex2, styles.spaced]}>
            <View>
              <H3 weight={"Bold"} color={"black"}>
                {I18n.t("bonus.cgn.name")}
              </H3>
              <DepartmentLabel>
                {I18n.t("bonus.cgn.departmentName")}
              </DepartmentLabel>
            </View>
            <View>
              {props.currentProfile && (
                <H3
                  weight={"Bold"}
                  color={"black"}
                  testID={"profile-name-surname"}
                >
                  {props.currentProfile}
                </H3>
              )}
            </View>
          </View>
          <View style={[styles.column, styles.flex1, styles.spaced]}>
            {canDisplayEycaLogo ? (
              <Image source={eycaLogo} style={styles.eycaLogo} />
            ) : (
              <HSpacer size={16} />
            )}
            <Image source={cgnLogo} style={styles.fullLogo} />
          </View>
        </View>
      </View>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  currentProfile: profileNameSurnameSelector(state),
  eycaDetails: eycaDetailSelector(state)
});

export default connect(mapStateToProps)(CgnCardComponent);

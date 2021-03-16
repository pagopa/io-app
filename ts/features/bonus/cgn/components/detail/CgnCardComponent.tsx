import * as React from "react";
import { View } from "native-base";
import WebView from "react-native-webview";
import { Image, ImageBackground, Platform, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H5 } from "../../../../../components/core/typography/H5";
import { H3 } from "../../../../../components/core/typography/H3";
import I18n from "../../../../../i18n";
import { Card } from "../../../../../../definitions/cgn/Card";
import { GlobalState } from "../../../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import { localeDateFormat } from "../../../../../utils/locale";
import cgnLogo from "../../../../../../img/bonus/cgn/cgn_logo.png";
import cardBg from "../../../../../../img/bonus/cgn/card_mask_1.png";
import { generateRandomSvgMovement, Point } from "../../utils/svgBackground";
import { playSvg } from "./CardSvgPayload";

type Props = {
  cgnDetails: Card;
} & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  cardContainer: {
    height: "100%"
  },
  cgnCard: {
    position: "absolute",
    width: "100%",
    height: 192,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    zIndex: 7,
    elevation: 7,
    top: 2
  },
  informationContainer: {
    height: "100%",
    top: Platform.select({ android: -220, default: -190 }),
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
  imageFull: {
    resizeMode: "stretch",
    height: "100%",
    zIndex: 8,
    elevation: 8
  },
  upperShadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 13,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 17,
    width: "100%"
  },
  bottomShadowBox: {
    marginBottom: 6,
    borderRadius: 8,
    borderBottomWidth: 15,
    borderBottomColor: "rgba(0,0,0,0.1)",
    width: "100%"
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

  return (
    <View style={[IOStyles.horizontalContentPadding, styles.cgnCard]}>
      {Platform.OS === "android" && <View style={styles.upperShadowBox} />}
      <ImageBackground
        source={cardBg}
        imageStyle={[styles.imageFull]}
        style={styles.cardContainer}
      >
        <WebView
          style={{ borderRadius: 15, top: -1, left: -1 }}
          source={{
            html: generatedSvg
          }}
        />
      </ImageBackground>
      {Platform.OS === "android" && <View style={styles.bottomShadowBox} />}
      <View style={[styles.informationContainer, styles.paddedContentFull]}>
        <View
          style={[
            IOStyles.row,
            IOStyles.flex,
            { justifyContent: "space-between" }
          ]}
        >
          <View style={[styles.column, styles.flex2, styles.spaced]}>
            <H3 weight={"Bold"} color={"black"}>
              {I18n.t("bonus.cgn.name")}
            </H3>
            <View>
              {props.cgnDetails.status !== "PENDING" && (
                <H5>
                  {`${I18n.t("cardComponent.validUntil")} ${localeDateFormat(
                    props.cgnDetails.expiration_date,
                    I18n.t("global.dateFormats.shortFormat")
                  )}`}
                </H5>
              )}
              {props.currentProfile && (
                <H3 weight={"Bold"} color={"black"}>
                  {props.currentProfile}
                </H3>
              )}
            </View>
          </View>
          <View style={[styles.column, styles.flex1, styles.spaced]}>
            <View hspacer />
            <Image source={cgnLogo} style={styles.fullLogo} />
          </View>
        </View>
      </View>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  currentProfile: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps)(CgnCardComponent);

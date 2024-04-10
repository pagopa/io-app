import * as React from "react";
import { useEffect } from "react";
import WebView from "react-native-webview";
import { View, ImageBackground, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import {
  Avatar,
  H6,
  LabelSmall,
  Tag,
  VSpacer
} from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { Card } from "../../../../../../definitions/cgn/Card";
import cgnLogo from "../../../../../../img/bonus/cgn/cgn_logo.png";
import eycaLogo from "../../../../../../img/bonus/cgn/eyca_logo.png";
import cardBg from "../../../../../../img/bonus/cgn/card_mask.png";
import { generateRandomSvgMovement, Point } from "../../utils/svgBackground";
import { eycaDetailSelector } from "../../store/reducers/eyca/details";
import { canEycaCardBeShown } from "../../utils/eyca";
import { useIOSelector } from "../../../../../store/hooks";
import { CardActivated } from "../../../../../../definitions/cgn/CardActivated";
import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { CardRevoked } from "../../../../../../definitions/cgn/CardRevoked";
import { CardExpired } from "../../../../../../definitions/cgn/CardExpired";
import { playSvg } from "./CardSvgPayload";

type Props = {
  cgnDetails: Card;
  onCardLoadEnd: () => void;
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 215,
    width: widthPercentageToDP(91.5)
  },
  cgnCard: {
    position: "absolute",
    alignSelf: "center",
    height: 205,
    top: 120
  },
  informationContainer: {
    width: widthPercentageToDP(90),
    maxWidth: 340,
    height: "100%",
    top: -205,
    zIndex: 2,
    elevation: 9
  },
  spaced: {
    justifyContent: "space-between"
  },
  paddedContentFull: {
    paddingLeft: 16,
    paddingTop: 8,
    paddingBottom: 16
  },
  imageFull: {
    resizeMode: "stretch",
    height: 215,
    width: widthPercentageToDP(95),
    maxWidth: 360,
    zIndex: 1
  },
  alignCenter: {
    alignItems: "center"
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

const CgnCardComponent = ({ cgnDetails, onCardLoadEnd }: Props) => {
  const eycaDetails = useIOSelector(eycaDetailSelector);

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

  const canCgnLogoBeShown = CardActivated.is(cgnDetails);
  const canDisplayEycaLogo =
    canCgnLogoBeShown && canEycaCardBeShown(eycaDetails);

  useEffect(() => () => onCardLoadEnd(), [onCardLoadEnd]);

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
          testID={"background-webview"}
          onLoadEnd={onCardLoadEnd}
          source={{
            html: generatedSvg
          }}
        />
      </ImageBackground>
      <View style={[styles.informationContainer, styles.paddedContentFull]}>
        <View style={[IOStyles.flex, styles.spaced]}>
          <View style={[IOStyles.rowSpaceBetween, styles.alignCenter]}>
            <H6 color={"black"}>{I18n.t("bonus.cgn.name")}</H6>
            {canCgnLogoBeShown && <Avatar logoUri={cgnLogo} size="small" />}
            {CardRevoked.is(cgnDetails) && (
              <Tag
                testID="card-status-revoked"
                variant="error"
                text={I18n.t("bonus.cgn.detail.status.badge.revoked")}
              />
            )}
            {CardExpired.is(cgnDetails) && (
              <Tag
                testID="card-status-expired"
                variant="error"
                text={I18n.t("bonus.cgn.detail.status.badge.expired")}
              />
            )}
          </View>
          <View style={[IOStyles.rowSpaceBetween, styles.alignCenter]}>
            <LabelSmall style={{ flex: 2 }} color="black">
              {I18n.t("bonus.cgn.departmentName")}
            </LabelSmall>
            <View style={{ flex: 1 }} />
          </View>
          <View style={[IOStyles.rowSpaceBetween, styles.alignCenter]}>
            {CardActivated.is(cgnDetails) && (
              <LabelSmall color={"black"} testID={"card-bottom-content"}>
                {I18n.t("bonus.cgn.detail.status.date.valid_until", {
                  date: formatDateAsShortFormat(cgnDetails.expiration_date)
                })}
              </LabelSmall>
            )}
            {canDisplayEycaLogo ? (
              <Avatar logoUri={eycaLogo} size="small" />
            ) : (
              <VSpacer size={40} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CgnCardComponent;

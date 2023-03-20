import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBText } from "native-base";
import React from "react";
import {
  View,
  Image,
  ImageBackground,
  Platform,
  StyleSheet
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { H4 } from "../../../../components/core/typography/H4";
import { H5 } from "../../../../components/core/typography/H5";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { localeDateFormat } from "../../../../utils/locale";
import cardBgPreview from "../../../../../img/features/idpay/initiative_preview_bg.png";
import bonusLogoTmp from "../../../../../img/features/idpay/bonus_logo.png";
import {
  hexToRgba,
  IOColors
} from "../../../../components/core/variables/IOColors";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import I18n from "../../../../i18n";

type Props = {
  initiativeId: string;
  initiativeName?: string;
  endDate: Date;
  availableAmount?: number;
  onPress?: () => void;
};

const IDPayCardPreviewComponent = (props: Props) => {
  const availableAmount = pipe(
    props.availableAmount,
    O.fromNullable,
    O.map(amount =>
      formatNumberAmount(amount).split(
        I18n.t("global.localization.decimalSeparator")
      )
    ),
    O.getOrElse(() => ["-", "-"])
  );

  const CardContent = () => (
    <TouchableDefaultOpacity
      style={[styles.row, styles.spaced, styles.paddedContentPreview]}
      onPress={props.onPress}
      accessible={true}
      accessibilityRole={"button"}
    >
      <View
        style={[styles.column, { width: widthPercentageToDP("60%") }]}
        accessible={false}
        accessibilityElementsHidden={true}
        importantForAccessibility={"no-hide-descendants"}
      >
        <View style={[styles.row, styles.alignItemsCenter, styles.spaced]}>
          <H5 color={"white"} weight={"Regular"}>
            {I18n.t("idpay.wallet.preview.validThrough", {
              endDate: localeDateFormat(
                props.endDate,
                I18n.t("global.dateFormats.shortFormat")
              )
            })}
          </H5>
        </View>
        <View style={[styles.row, styles.alignItemsCenter, styles.spaced]}>
          <H4
            weight={"Bold"}
            color={"white"}
            ellipsizeMode="tail"
            numberOfLines={1}
            style={styles.name}
          >
            {props.initiativeName}
          </H4>
          <NBText
            bold={true}
            white={true}
            style={[styles.amountTextBase, { textAlign: "right" }]}
          >
            {"€ "}
            <NBText white={true} style={styles.amountTextUpper}>
              {`${availableAmount[0]}${I18n.t(
                "global.localization.decimalSeparator"
              )}`}
            </NBText>
            <NBText white={true} style={styles.amountTextLower}>
              {availableAmount[1]}
            </NBText>
          </NBText>
        </View>
      </View>
      {/* TODO: add correct initiative logo, this is only temporary */}
      <Image source={bonusLogoTmp} style={styles.previewLogo} />
    </TouchableDefaultOpacity>
  );

  return (
    <>
      {Platform.OS === "android" && (
        <View
          style={styles.upperShadowBox}
          accessible={false}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
        />
      )}
      <ImageBackground
        source={cardBgPreview}
        style={[styles.card, Platform.OS === "ios" ? styles.cardShadow : {}]}
        imageStyle={styles.cardImage}
      >
        <CardContent />
      </ImageBackground>
    </>
  );
};

const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  paddedContentPreview: {
    paddingLeft: 18,
    paddingTop: 8,
    paddingRight: 22
  },
  row: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  },
  column: {
    flexDirection: "column"
  },
  alignItemsCenter: {
    alignItems: "center"
  },
  upperShadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 13,
    borderTopColor: opaqueBorderColor,
    height: 17,
    width: "100%"
  },
  card: {
    marginBottom: -20,
    height: 88,
    marginLeft: 0,
    marginRight: 0
  },
  cardShadow: {
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    borderRadius: 8,
    zIndex: -7,
    elevation: -7
  },
  cardImage: {
    resizeMode: "stretch",
    height: 88,
    width: "100%"
  },
  name: {
    flex: 1,
    marginRight: 8
  },
  amountTextBase: {
    fontSize: 20,
    lineHeight: 32
  },
  amountTextUpper: { fontSize: 24 },
  amountTextLower: { fontSize: 16 },
  previewLogo: {
    resizeMode: "contain",
    height: 40,
    width: 40,
    alignSelf: "center"
  }
});

export default IDPayCardPreviewComponent;

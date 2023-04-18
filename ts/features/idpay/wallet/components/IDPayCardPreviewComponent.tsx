import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  View
} from "react-native";
import bonusLogoTmp from "../../../../../img/features/idpay/bonus_logo.png";
import walletCardBg from "../../../../../img/features/idpay/wallet_card.png";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import {
  IOColors,
  hexToRgba
} from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { formatNumberAmount } from "../../../../utils/stringBuilder";

type Props = {
  initiativeId: string;
  initiativeName?: string;
  endDate: Date;
  availableAmount?: number;
  onPress?: () => void;
};

const formatNumberRightSign = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;

const IDPayCardPreviewComponent = (props: Props) => {
  const { initiativeName } = props;

  const availableAmount = pipe(
    props.availableAmount,
    O.fromNullable,
    O.map(formatNumberRightSign),
    O.getOrElse(() => "-")
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
        source={walletCardBg}
        style={[styles.card, Platform.OS === "ios" ? styles.cardShadow : {}]}
        imageStyle={styles.cardImage}
      >
        <TouchableDefaultOpacity
          style={styles.cardContent}
          onPress={props.onPress}
          accessible={true}
          accessibilityRole={"button"}
        >
          <View style={[IOStyles.flex, IOStyles.rowSpaceBetween]}>
            <H4>{initiativeName}</H4>
            <LabelSmall weight="SemiBold" fontSize="regular" color="black">
              {availableAmount}
            </LabelSmall>
          </View>
          <HSpacer size={8} />
          <Image source={bonusLogoTmp} style={styles.previewLogo} />
          <HSpacer size={8} />
        </TouchableDefaultOpacity>
        <VSpacer size={16} />
      </ImageBackground>
    </>
  );
};

const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
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
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16
  },
  previewLogo: {
    backgroundColor: IOColors.white,
    height: 32,
    width: 32,
    borderRadius: 4
  }
});

export default IDPayCardPreviewComponent;

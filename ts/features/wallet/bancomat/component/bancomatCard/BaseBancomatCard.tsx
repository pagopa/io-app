import { View } from "native-base";
import * as React from "react";
import {
  Image,
  ImageStyle,
  Platform,
  StyleProp,
  StyleSheet
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import pagoBancomatLogo from "../../../../../../img/wallet/cards-icons/pagobancomat.png";
import { Body } from "../../../../../components/core/typography/Body";
import { H5 } from "../../../../../components/core/typography/H5";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import { localeDateFormat } from "../../../../../utils/locale";
import { useImageResize } from "../../../onboarding/bancomat/screens/hooks/useImageResize";

type Props = {
  abiLogo?: string;
  expiringDate?: Date;
  user: string;
};

const styles = StyleSheet.create({
  cardBox: {
    height: 192,
    width: widthPercentageToDP("90%"),
    maxWidth: 343,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 20,
    paddingBottom: 22,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: customVariables.brandGray,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.18,
    shadowRadius: 4.65,
    zIndex: 7,
    elevation: 7
  },
  shadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 10,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 15,
    width: widthPercentageToDP("90%"),
    maxWidth: 343
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  bancomatLogo: {
    width: 60,
    height: 36,
    resizeMode: "contain"
  }
});

const BASE_IMG_W = 160;
const BASE_IMG_H = 40;

/**
 * The base component that represents a full bancomat card
 * @param props
 * @constructor
 */
const BaseBancomatCard: React.FunctionComponent<Props> = (props: Props) => {
  const imgDimensions = useImageResize(BASE_IMG_W, BASE_IMG_H, props.abiLogo);

  const imageStyle: StyleProp<ImageStyle> | undefined = imgDimensions.fold(
    undefined,
    imgDim => ({
      width: imgDim[0],
      height: imgDim[1],
      resizeMode: "contain"
    })
  );

  return (
    <>
      {Platform.OS === "android" && <View style={styles.shadowBox} />}
      <View style={styles.cardBox}>
        <View>
          <Image style={imageStyle} source={{ uri: props.abiLogo }} />
          <View spacer={true} />
          {props.expiringDate && (
            <H5 color={"bluegrey"} weight={"Regular"}>{`${I18n.t(
              "cardComponent.validUntil"
            )} ${localeDateFormat(
              props.expiringDate,
              I18n.t("global.dateFormats.numericMonthYear")
            )}`}</H5>
          )}
        </View>
        <View style={styles.bottomRow}>
          <Body>{props.user.toLocaleUpperCase()}</Body>
          <Image style={styles.bancomatLogo} source={pagoBancomatLogo} />
        </View>
      </View>
    </>
  );
};

export default BaseBancomatCard;

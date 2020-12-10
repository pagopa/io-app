import { Option } from "fp-ts/lib/Option";
import { Badge, View } from "native-base";
import * as React from "react";
import {
  Image,
  ImageStyle,
  Platform,
  StyleProp,
  StyleSheet
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { Abi } from "../../../../../../definitions/pagopa/walletv2/Abi";
import pagoBancomatLogo from "../../../../../../img/wallet/cards-icons/pagobancomat.png";
import { Body } from "../../../../../components/core/typography/Body";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import { localeDateFormat } from "../../../../../utils/locale";
import { useImageResize } from "../../../onboarding/bancomat/screens/hooks/useImageResize";

type Props = {
  abi: Abi;
  expiringDate?: Date;
  user: string;
  blocked?: boolean;
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
  },
  badgeInfo: {
    borderWidth: 1,
    borderStyle: "solid",
    width: 65,
    height: 25,
    flexDirection: "row"
  },
  badgeInfoExpired: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.red
  }
});

const BASE_IMG_W = 160;
const BASE_IMG_H = 40;

/**
 * Render the image (if available) or the bank name (if available)
 * or the generic bancomat string (final fallback).
 * @param abi
 * @param size
 * TODO: refactor with {@link BancomatWalletPreview}
 */
const renderBankLogo = (abi: Abi, size: Option<[number, number]>) =>
  size.fold(
    <Body numberOfLines={1}>
      {abi.name ?? I18n.t("wallet.methods.bancomat.name")}
    </Body>,
    imgDim => {
      const imageUrl = abi.logoUrl;
      const imageStyle: StyleProp<ImageStyle> = {
        width: imgDim[0],
        height: imgDim[1],
        resizeMode: "contain"
      };
      return imageUrl ? (
        <Image source={{ uri: imageUrl }} style={imageStyle} />
      ) : null;
    }
  );

/**
 * The base component that represents a full bancomat card
 * @param props
 * @constructor
 */
const BaseBancomatCard: React.FunctionComponent<Props> = (props: Props) => {
  const imgDimensions = useImageResize(
    BASE_IMG_W,
    BASE_IMG_H,
    props.abi?.logoUrl
  );

  return (
    <>
      {Platform.OS === "android" && <View style={styles.shadowBox} />}
      <View style={styles.cardBox}>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            {renderBankLogo(props.abi, imgDimensions)}
            {props.blocked && (
              <Badge style={[styles.badgeInfo, styles.badgeInfoExpired]}>
                <H5 color="red">{I18n.t("global.badge.blocked")}</H5>
              </Badge>
            )}
          </View>
          <View spacer={true} />
          {props.expiringDate && (
            <H5 color={"bluegrey"} weight={"Regular"}>{`${I18n.t(
              "cardComponent.expiresOn"
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

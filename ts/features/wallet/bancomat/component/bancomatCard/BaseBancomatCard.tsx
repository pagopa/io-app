import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import {
  View,
  Image,
  ImageStyle,
  Platform,
  StyleProp,
  StyleSheet
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { Abi } from "../../../../../../definitions/pagopa/walletv2/Abi";
import pagoBancomatLogo from "../../../../../../img/wallet/cards-icons/pagobancomat.png";
import { IOBadge } from "../../../../../components/core/IOBadge";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H5 } from "../../../../../components/core/typography/H5";
import {
  IOColors,
  hexToRgba
} from "../../../../../components/core/variables/IOColors";
import I18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import { localeDateFormat } from "../../../../../utils/locale";
import { BrandImage } from "../../../component/card/BrandImage";
import { useImageResize } from "../../../onboarding/bancomat/screens/hooks/useImageResize";

type Props = {
  abi: Abi;
  expiringDate?: Date;
  isExpired?: boolean;
  user: string;
  blocked?: boolean;
  accessibilityLabel?: string;
};

const BASE_IMG_W = 160;
const BASE_IMG_H = 40;
const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

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
    backgroundColor: IOColors.greyUltraLight,
    borderRadius: 8,
    shadowColor: IOColors.black,
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
    borderTopColor: opaqueBorderColor,
    height: 15,
    width: widthPercentageToDP("90%"),
    maxWidth: 343
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  }
});

/**
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (
  bankName: string,
  expiringDate?: Date,
  holder?: string
) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.bancomat", {
    bankName
  });

  const computedValidity =
    expiringDate !== undefined
      ? `, ${I18n.t("cardComponent.validUntil")} ${localeDateFormat(
          expiringDate,
          I18n.t("global.dateFormats.numericMonthYear")
        )}`
      : "";

  const computedHolder =
    holder !== undefined
      ? `, ${I18n.t("wallet.accessibility.cardHolder")} ${holder}`
      : "";

  return `${cardRepresentation}${computedValidity}${computedHolder}`;
};

/**
 * Render the image (if available) or the bank name (if available)
 * or the generic bancomat string (final fallback).
 * @param abi
 * @param size
 * TODO: refactor with {@link BancomatWalletPreview}
 */
const renderBankLogo = (abi: Abi, size: O.Option<[number, number]>) =>
  pipe(
    size,
    O.fold(
      () => (
        <Body numberOfLines={1}>
          {abi.name ?? I18n.t("wallet.methods.bancomat.name")}
        </Body>
      ),
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
    )
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
      <View
        style={styles.cardBox}
        accessibilityLabel={getAccessibilityRepresentation(
          props.abi.name ?? "",
          props.expiringDate,
          props.user
        )}
        accessible
      >
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
              <IOBadge
                variant="outline"
                color="red"
                text={I18n.t("global.badges.blocked")}
              />
            )}
          </View>
          <VSpacer size={16} />
          {props.expiringDate && (
            <H5
              color={props.isExpired ? "red" : "bluegreyDark"}
              weight={"SemiBold"}
            >{`${I18n.t("cardComponent.validUntil")} ${localeDateFormat(
              props.expiringDate,
              I18n.t("global.dateFormats.numericMonthYear")
            )}`}</H5>
          )}
        </View>
        <View style={styles.bottomRow}>
          <Body>{props.user.toLocaleUpperCase()}</Body>
          <BrandImage image={pagoBancomatLogo} />
        </View>
      </View>
    </>
  );
};

export default BaseBancomatCard;

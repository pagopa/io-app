import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import {
  View,
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet
} from "react-native";
import { Abi } from "../../../../../definitions/pagopa/walletv2/Abi";
import abiLogoFallback from "../../../../../img/wallet/cards-icons/abiLogoFallback.png";
import { IOBadge } from "../../../../components/core/IOBadge";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H5 } from "../../../../components/core/typography/H5";
import I18n from "../../../../i18n";
import { localeDateFormat } from "../../../../utils/locale";
import BaseCardComponent from "../../component/card/BaseCardComponent";
import { BlurredPan } from "../../component/card/BlurredPan";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";

type Props = {
  caption?: string;
  expiringDate?: Date;
  isExpired?: boolean;
  abi: Abi;
  brand?: string;
  brandLogo: ImageSourcePropType;
  blocked?: boolean;
  accessibilityLabel?: string;
};

const styles = StyleSheet.create({
  abiLogoFallback: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },
  brandLogo: {
    width: 48,
    height: 31,
    resizeMode: "contain"
  }
});

const BASE_IMG_W = 160;
const BASE_IMG_H = 40;

/**
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (
  brand: string,
  bankName: string,
  expiringDate?: Date
) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.coBadge", {
    brand,
    bankName
  });

  const computedValidity =
    expiringDate !== undefined
      ? `, ${I18n.t("cardComponent.validUntil")} ${localeDateFormat(
          expiringDate,
          I18n.t("global.dateFormats.numericMonthYear")
        )}`
      : "";

  return `${cardRepresentation}${computedValidity}`;
};

const BaseCoBadgeCard: React.FunctionComponent<Props> = (props: Props) => {
  const imgDimensions = useImageResize(
    BASE_IMG_W,
    BASE_IMG_H,
    props.abi?.logoUrl
  );

  const imageStyle: StyleProp<ImageStyle> | undefined = pipe(
    imgDimensions,
    O.fold(
      () => undefined,
      imgDim => ({
        width: imgDim[0],
        height: imgDim[1],
        resizeMode: "contain"
      })
    )
  );
  return (
    <BaseCardComponent
      accessibilityLabel={getAccessibilityRepresentation(
        props.brand ?? "",
        props.abi.name ?? "",
        props.expiringDate
      )}
      topLeftCorner={
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            {props.abi.logoUrl && imageStyle ? (
              <Image
                source={{ uri: props.abi.logoUrl }}
                style={imageStyle}
                key={"abiLogo"}
                testID={"abiLogo"}
              />
            ) : (
              <Image
                source={abiLogoFallback}
                style={styles.abiLogoFallback}
                key={"abiLogoFallback"}
                testID={"abiLogoFallback"}
              />
            )}
            {props.blocked && (
              <IOBadge
                variant="outline"
                color="red"
                text={I18n.t("global.badges.blocked")}
                testID={"blockedBadge"}
              />
            )}
          </View>
          {props.expiringDate && (
            <>
              <VSpacer size={16} />
              <H5
                weight={props.isExpired ? "SemiBold" : "Regular"}
                color={props.isExpired ? "red" : "bluegreyDark"}
                testID={"expirationDate"}
              >
                {I18n.t("wallet.cobadge.details.card.validUntil", {
                  expiryDate: localeDateFormat(
                    props.expiringDate,
                    I18n.t("global.dateFormats.numericMonthYear")
                  )
                })}
              </H5>
            </>
          )}
        </>
      }
      bottomLeftCorner={
        <>
          {props.caption && (
            <>
              <View style={{ flexDirection: "row" }}>
                <BlurredPan testID="caption">{props.caption}</BlurredPan>
              </View>
              <VSpacer size={8} />
            </>
          )}
        </>
      }
      bottomRightCorner={
        <View style={{ justifyContent: "flex-end", flexDirection: "column" }}>
          <Image style={styles.brandLogo} source={props.brandLogo} />
        </View>
      }
    />
  );
};

export default BaseCoBadgeCard;

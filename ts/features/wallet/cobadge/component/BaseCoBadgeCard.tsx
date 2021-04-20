import { Badge, View } from "native-base";
import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet
} from "react-native";
import { Abi } from "../../../../../definitions/pagopa/walletv2/Abi";
import abiLogoFallback from "../../../../../img/wallet/cards-icons/abiLogoFallback.png";
import { H5 } from "../../../../components/core/typography/H5";
import { IOColors } from "../../../../components/core/variables/IOColors";
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
  brandLogo: ImageSourcePropType;
  blocked?: boolean;
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
  },
  bankName: { textTransform: "capitalize" },
  badgeInfo: {
    borderWidth: 1,
    borderStyle: "solid",
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

const BaseCoBadgeCard: React.FunctionComponent<Props> = (props: Props) => {
  const imgDimensions = useImageResize(
    BASE_IMG_W,
    BASE_IMG_H,
    props.abi?.logoUrl
  );

  const imageStyle: StyleProp<ImageStyle> | undefined = imgDimensions.fold(
    undefined,
    imgDim => ({
      width: imgDim[0],
      height: imgDim[1],
      resizeMode: "contain"
    })
  );
  return (
    <BaseCardComponent
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
              <Badge
                style={[styles.badgeInfo, styles.badgeInfoExpired]}
                testID={"blockedBadge"}
              >
                <H5 color="red">{I18n.t("global.badges.blocked")}</H5>
              </Badge>
            )}
          </View>
          {props.expiringDate && (
            <>
              <View spacer={true} />
              <H5
                weight={props.isExpired ? "SemiBold" : "Regular"}
                color={props.isExpired ? "red" : "bluegrey"}
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
              <View spacer small />
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

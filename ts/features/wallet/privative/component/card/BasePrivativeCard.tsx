import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet
} from "react-native";
import { Badge, View } from "native-base";
import I18n from "../../../../../i18n";
import BaseCardComponent from "../../../component/BaseCardComponent";
import { useImageResize } from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import abiLogoFallback from "../../../../../../img/wallet/cards-icons/abiLogoFallback.png";
import { Abi } from "../../../../../../definitions/pagopa/walletv2/Abi";
import { IOColors } from "../../../../../components/core/variables/IOColors";

type Props = {
  caption?: string;
  abi: Abi;
  icon: string;
  blocked?: boolean;
};

const styles = StyleSheet.create({
  abiLogoFallback: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },
  icon: {
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

const BasePrivativeCard: React.FunctionComponent<Props> = (props: Props) => {
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
                testID={"abiLogo"}
              />
            ) : (
              <Image
                source={abiLogoFallback}
                style={styles.abiLogoFallback}
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
        </>
      }
      bottomLeftCorner={
        <View>
          {props.caption && (
            <>
              <View style={{ flexDirection: "row" }}>
                <H4 weight={"Regular"} testID="caption">
                  {props.caption}
                </H4>
              </View>
              <View spacer small />
            </>
          )}
        </View>
      }
      bottomRightCorner={
        <View style={{ justifyContent: "flex-end", flexDirection: "column" }}>
          <Image style={styles.icon} source={props.icon} />
        </View>
      }
    />
  );
};

export default BasePrivativeCard;

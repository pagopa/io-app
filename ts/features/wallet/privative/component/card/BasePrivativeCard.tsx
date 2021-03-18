import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  StyleProp,
  StyleSheet
} from "react-native";
import { Option } from "fp-ts/lib/Option";
import { Badge, View } from "native-base";
import I18n from "../../../../../i18n";
import BaseCardComponent from "../../../component/BaseCardComponent";
import { useImageResize } from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import unknownGdo from "../../../../../../img/wallet/unknown-gdo.png";
import { isImageURISource } from "../../../../../types/image";

type Props = {
  loyaltyLogo: ImageSourcePropType;
  caption?: string;
  gdoLogo?: ImageURISource;
  blocked?: boolean;
};

const styles = StyleSheet.create({
  topLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  unknownLoyaltyLogo: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },
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
const fallbackLoyaltyLogo: React.ReactElement = (
  <Image
    source={unknownGdo}
    style={styles.unknownLoyaltyLogo}
    key={"unknownLoyaltyLogo"}
    testID={"unknownLoyaltyLogo"}
  />
);

const BASE_IMG_W = 100;
const BASE_IMG_H = 30;

const renderLoyaltyLogo = (
  loyaltyLogo: ImageSourcePropType,
  size: Option<[number, number]>
) =>
  size.fold(fallbackLoyaltyLogo, imgDim => {
    const imageStyle: StyleProp<ImageStyle> = {
      width: imgDim[0],
      height: imgDim[1],
      resizeMode: "contain"
    };
    return (
      <Image
        source={loyaltyLogo}
        style={imageStyle}
        key={"loyaltyLogo"}
        testID={"loyaltyLogo"}
      />
    );
  });

const renderGdoLogo = (gdoLogo: ImageURISource) =>
  useImageResize(BASE_IMG_W, BASE_IMG_H, gdoLogo.uri).fold(
    undefined,
    imgDim => {
      const imageStyle: StyleProp<ImageStyle> = {
        width: imgDim[0],
        height: imgDim[1],
        resizeMode: "contain"
      };
      return (
        <Image
          source={gdoLogo}
          style={imageStyle}
          key={"gdoLogo"}
          testID={"gdoLogo"}
        />
      );
    }
  );

const BasePrivativeCard: React.FunctionComponent<Props> = (props: Props) => {
  const loyaltyLogo = isImageURISource(props.loyaltyLogo)
    ? renderLoyaltyLogo(
        props.loyaltyLogo,
        useImageResize(BASE_IMG_W, BASE_IMG_H, props.loyaltyLogo.uri)
      )
    : fallbackLoyaltyLogo;

  return (
    <BaseCardComponent
      topLeftCorner={
        <>
          <View style={styles.topLeftContainer}>
            {props.gdoLogo && renderGdoLogo(props.gdoLogo)}

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
        <>
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
        </>
      }
      bottomRightCorner={loyaltyLogo}
    />
  );
};

export default BasePrivativeCard;

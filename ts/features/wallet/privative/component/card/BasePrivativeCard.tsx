import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet
} from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import { Badge, View } from "native-base";
import I18n from "../../../../../i18n";
import BaseCardComponent from "../../../component/BaseCardComponent";
import { useImageResize } from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import unknownGdo from "../../../../../../img/wallet/unknown-gdo.png";

type Props = {
  icon: ImageSourcePropType;
  caption?: string;
  gdoLogo?: string;
  blocked?: boolean;
};

const styles = StyleSheet.create({
  cardLogoFallback: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },
  icon: {
    width: 120,
    height: 30,
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

const BASE_IMG_W = 120;
const BASE_IMG_H = 30;

const BasePrivativeCard: React.FunctionComponent<Props> = (props: Props) => {
  const cardLogo = fromNullable(props.gdoLogo).fold(
    <Image
      style={styles.cardLogoFallback}
      source={unknownGdo}
      testID={"fallbackLoyaltyLogo"}
    />,
    cL => {
      const imgDimensions = useImageResize(BASE_IMG_W, BASE_IMG_H, cL);
      const imageStyle: StyleProp<ImageStyle> | undefined = imgDimensions.fold(
        undefined,
        imgDim => ({
          width: imgDim[0],
          height: imgDim[1],
          resizeMode: "contain"
        })
      );
      return (
        <Image style={imageStyle} source={{ uri: cL }} testID={"loyaltyLogo"} />
      );
    }
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
            <Image source={props.icon} style={styles.icon} testID={"gdoLogo"} />

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
      bottomRightCorner={cardLogo}
    />
  );
};

export default BasePrivativeCard;

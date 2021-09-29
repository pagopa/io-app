import { Option } from "fp-ts/lib/Option";
import { Badge, View } from "native-base";
import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  StyleProp,
  StyleSheet
} from "react-native";
import unknownGdo from "../../../../../../img/wallet/unknown-gdo.png";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import I18n from "../../../../../i18n";
import { isImageURISource } from "../../../../../types/image";
import BaseCardComponent from "../../../component/card/BaseCardComponent";
import { BlurredPan } from "../../../component/card/BlurredPan";
import { useImageResize } from "../../../onboarding/bancomat/screens/hooks/useImageResize";

type Props = {
  loyaltyLogo?: ImageSourcePropType;
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

const GdoLogo = (props: { gdoLogo: ImageURISource }) =>
  useImageResize(BASE_IMG_W, BASE_IMG_H, props.gdoLogo.uri).fold(
    null,
    imgDim => {
      const imageStyle: StyleProp<ImageStyle> = {
        width: imgDim[0],
        height: imgDim[1],
        resizeMode: "contain"
      };
      return (
        <Image
          source={props.gdoLogo}
          style={imageStyle}
          key={"gdoLogo"}
          testID={"gdoLogo"}
        />
      );
    }
  );

const BasePrivativeCard: React.FunctionComponent<Props> = (props: Props) => {
  const imageURI =
    props.loyaltyLogo && isImageURISource(props.loyaltyLogo)
      ? props.loyaltyLogo.uri
      : undefined;

  const maybeSize = useImageResize(BASE_IMG_W, BASE_IMG_H, imageURI);
  const loyaltyLogo =
    props.loyaltyLogo && isImageURISource(props.loyaltyLogo)
      ? renderLoyaltyLogo(props.loyaltyLogo, maybeSize)
      : fallbackLoyaltyLogo;

  return (
    <BaseCardComponent
      topLeftCorner={
        <>
          <View style={styles.topLeftContainer}>
            {props.gdoLogo && <GdoLogo gdoLogo={props.gdoLogo} />}

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
                <BlurredPan testID="caption">{props.caption}</BlurredPan>
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

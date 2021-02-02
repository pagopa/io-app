import * as React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet
} from "react-native";
import { View } from "native-base";
import I18n from "../../../../i18n";
import BaseCardComponent from "../../component/BaseCardComponent";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";
import { H4 } from "../../../../components/core/typography/H4";
import { H5 } from "../../../../components/core/typography/H5";
import abiLogoFallback from "../../../../../img/wallet/cards-icons/abiLogoFallback.png";

type Props = {
  caption?: string;
  expireMonth?: string;
  expireYear?: string;
  abiLogo?: string;
  brandLogo: ImageSourcePropType;
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
  bankName: { textTransform: "capitalize" }
});

const BASE_IMG_W = 160;
const BASE_IMG_H = 40;

const CobadgeCard: React.FunctionComponent<Props> = (props: Props) => {
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
    <BaseCardComponent
      topLeftCorner={
        <>
          {props.abiLogo && imageStyle ? (
            <Image
              source={{ uri: props.abiLogo }}
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
          {props.expireMonth && props.expireYear && (
            <>
              <View spacer={true} />
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"expirationDate"}
              >
                {I18n.t("wallet.cobadge.details.card.validUntil", {
                  expireMonth: props.expireMonth,
                  expireYear: props.expireYear
                })}
              </H5>
            </>
          )}
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
          <Image style={styles.brandLogo} source={props.brandLogo} />
        </View>
      }
    />
  );
};

export default CobadgeCard;

import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { Card } from "../../../../../../../definitions/pagopa/bancomat/Card";
import { Body } from "../../../../../../components/core/typography/Body";
import { LabelSmall } from "../../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import customVariables from "../../../../../../theme/variables";
import { formatDateAsLocal } from "../../../../../../utils/dates";
import { ImageDimensions, useImageResize } from "../hooks/useImageResize";

type Props = {
  abiLogo?: string;
  pan: Card;
};

const styles = StyleSheet.create({
  cardBox: {
    height: 192,
    width: widthPercentageToDP("90%"),
    maxWidth: 343,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: "column",
    backgroundColor: IOColors.aqua,
    borderRadius: 8
  }
});

const BASE_IMG_W = 160;
const BASE_IMG_H = 40;

const PanCardComponent: React.FunctionComponent<Props> = (props: Props) => {
  const [imgDimensions, setImgDimensions] = React.useState<ImageDimensions>({
    w: 0,
    h: 0
  });

  useImageResize(BASE_IMG_W, BASE_IMG_H, setImgDimensions, props.abiLogo);

  const imageStyle: StyleProp<ImageStyle> = {
    width: imgDimensions.w,
    height: imgDimensions.h,
    resizeMode: "contain"
  };

  return (
    <View style={styles.cardBox}>
      <Image style={imageStyle} source={{ uri: props.abiLogo }} />
      <View spacer={true} small={true} />
      {props.pan.expiringDate && (
        <LabelSmall color={"bluegrey"}>{`Valida fino al ${formatDateAsLocal(
          props.pan.expiringDate
        )}`}</LabelSmall>
      )}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "red",
          position: "absolute",
          bottom: 15,
          left: customVariables.contentPadding
        }}
      >
        <Image
          style={{
            width: 60,
            height: 36,
            resizeMode: "contain",
            alignSelf: "flex-end"
          }}
          source={{
            uri:
              "https://www.drop-pos.shop/images/home/pagamenti/pagobancomat.png"
          }}
        />
      </View>
    </View>
  );
};

export default PanCardComponent;

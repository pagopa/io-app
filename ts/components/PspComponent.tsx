import React, { FC } from "react";
import {
  ImageStyle,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  View,
  Image
} from "react-native";
import { useImageResize } from "../features/wallet/onboarding/bancomat/screens/hooks/useImageResize";
import customVariables from "../theme/variables";
import { Psp } from "../types/pagopa";
import { formatNumberCentsToAmount } from "../utils/stringBuilder";
import { Body } from "./core/typography/Body";
import { H4 } from "./core/typography/H4";
import TouchableDefaultOpacity from "./TouchableDefaultOpacity";
import IconFont from "./ui/IconFont";

const ICON_SIZE = 24;
const IMAGE_WIDTH = 100;
const IMAGE_HEIGHT = 50;

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding,
    flexDirection: "column"
  },
  line1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  feeContainer: {
    flexDirection: "row",
    alignItems: "center"
  }
});

type Props = {
  psp: ListRenderItemInfo<Psp>;
  pickPsp: (idPsp: number, psps: ReadonlyArray<Psp>) => any;
  allPsps: ReadonlyArray<Psp>;
};

export const PspComponent: FC<Props> = ({ psp, pickPsp, allPsps }) => {
  const { item } = psp;
  const imageResize = useImageResize(IMAGE_WIDTH, IMAGE_HEIGHT, item.logoPSP);
  const cost = formatNumberCentsToAmount(item.fixedCost.amount);

  const renderImage = imageResize.fold(
    <Body>{item.businessName}</Body>,
    size => {
      const imageStyle: StyleProp<ImageStyle> = {
        width: size[0],
        height: size[1],
        resizeMode: "contain"
      };

      return (
        <Image
          style={imageStyle}
          resizeMode="contain"
          source={{ uri: item.logoPSP }}
        />
      );
    }
  );

  const onPress = () => pickPsp(item.id, allPsps);

  return (
    <TouchableDefaultOpacity onPress={onPress} style={styles.itemContainer}>
      <View style={styles.line1}>
        {renderImage}
        <View style={styles.feeContainer}>
          <H4 color="blue">{cost}</H4>
          <IconFont
            name="io-right"
            size={ICON_SIZE}
            color={customVariables.contentPrimaryBackground}
          />
        </View>
      </View>
    </TouchableDefaultOpacity>
  );
};

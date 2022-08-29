import React, { FC } from "react";
import { ImageStyle, StyleProp, StyleSheet, View, Image } from "react-native";
import { useImageResize } from "../../../features/wallet/onboarding/bancomat/screens/hooks/useImageResize";
import customVariables from "../../../theme/variables";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import { Body } from "../../core/typography/Body";
import { H4 } from "../../core/typography/H4";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import IconFont from "../../ui/IconFont";
import { PspData } from "../../../../definitions/pagopa/PspData";
import { getPspIconUrlFromAbi } from "../../../utils/paymentMethod";

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
  psp: PspData;
  onPress: () => void;
};

export const PspComponent: FC<Props> = ({ psp, onPress }) => {
  const pspLogoUrl = getPspIconUrlFromAbi(psp.codiceAbi);
  const imgDimensions = useImageResize(IMAGE_WIDTH, IMAGE_HEIGHT, pspLogoUrl);
  const cost = formatNumberCentsToAmount(psp.fee);

  const imageStyle: StyleProp<ImageStyle> | undefined = imgDimensions.fold(
    undefined,
    imgDim => ({
      width: imgDim[0],
      height: imgDim[1],
      resizeMode: "contain"
    })
  );

  return (
    <TouchableDefaultOpacity
      onPress={onPress}
      style={styles.itemContainer}
      testID={`psp-${psp.idPsp}`}
    >
      <View style={styles.line1}>
        {imageStyle ? (
          <Image
            source={{ uri: pspLogoUrl }}
            style={imageStyle}
            testID="logoPSP"
          />
        ) : (
          <Body testID="businessName">{psp.ragioneSociale}</Body>
        )}
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

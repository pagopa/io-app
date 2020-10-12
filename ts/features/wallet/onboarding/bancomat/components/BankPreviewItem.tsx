import { ListItem, View } from "native-base";
import * as React from "react";
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
import I18n from "../../../../../i18n";
import { Abi } from "../../../../../../definitions/pagopa/bancomat/Abi";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import IconFont from "../../../../../components/ui/IconFont";
import {
  ImageDimensions,
  useImageResize
} from "../screens/hooks/useImageResize";

type Props = {
  bank: Abi;
  inList: boolean;
  onPress: (abi: string) => void;
};

const BASE_IMG_H = 40;
const BASE_IMG_W = 160;

const styles = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 105
  },
  listItem: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  gridItem: {
    margin: 16,
    padding: 30,
    height: 72,
    width: 156,
    flexDirection: "column",
    flex: 1
  },
  boundaryImage: {
    height: BASE_IMG_H,
    width: BASE_IMG_W,
    justifyContent: "center",
    alignItems: "flex-start"
  }
});

export const BankPreviewItem: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [imageDimensions, setImageDimensions] = React.useState<ImageDimensions>(
    { w: 0, h: 0 }
  );

  useImageResize(
    BASE_IMG_W,
    BASE_IMG_H,
    setImageDimensions,
    props.bank.logoUrl
  );

  const imageStyle: StyleProp<ImageStyle> = {
    width: imageDimensions.w,
    height: imageDimensions.h,
    resizeMode: "contain"
  };

  const onItemPress = () => props.bank.abi && props.onPress(props.bank.abi);
  const bankName = props.bank.name || I18n.t("wallet.searchAbi.noName");
  const bankLogo = (
    <View style={styles.boundaryImage}>
      {props.bank.logoUrl && imageDimensions && (
        <Image style={imageStyle} source={{ uri: props.bank.logoUrl }} />
      )}
    </View>
  );

  return props.inList ? (
    <ListItem style={styles.flexRow} onPress={onItemPress}>
      <View style={styles.listItem}>
        <View spacer={true} />
        {bankLogo}
        <View spacer={true} small={true} />
        <LabelSmall color={"bluegrey"} weight={"Bold"}>
          {bankName}
        </LabelSmall>
        <View spacer={true} />
      </View>
      <IconFont name={"io-right"} color={IOColors.blue} />
    </ListItem>
  ) : (
    <ButtonDefaultOpacity
      white={true}
      style={styles.gridItem}
      onPress={onItemPress}
    >
      {bankLogo}
      <View spacer={true} />
      <LabelSmall color={"bluegrey"} weight={"Bold"}>
        {bankName}
      </LabelSmall>
    </ButtonDefaultOpacity>
  );
};

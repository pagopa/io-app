import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
import {
  Icon,
  PressableListItemBase,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Abi } from "../../../../../../definitions/pagopa/walletv2/Abi";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import I18n from "../../../../../i18n";
import { useImageResize } from "../hooks/useImageResize";

type Props = {
  // TODO: change bank in info and use a generic type
  bank: Abi;
  onPress: (abi: string) => void;
};

const BASE_IMG_H = 40;
const BASE_IMG_W = 160;

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  boundaryImage: {
    height: BASE_IMG_H,
    width: BASE_IMG_W,
    justifyContent: "center",
    alignItems: "flex-start"
  }
});

// TODO: rename the component, in order to have a generic list item that accepts an image with a text
export const BankPreviewItem: React.FunctionComponent<Props> = (
  props: Props
) => {
  const imageDimensions = useImageResize(
    BASE_IMG_W,
    BASE_IMG_H,
    props.bank.logoUrl
  );

  const imageStyle: StyleProp<ImageStyle> | undefined = pipe(
    imageDimensions,
    O.fold(
      () => undefined,
      imgDim => ({
        width: imgDim[0],
        height: imgDim[1],
        resizeMode: "contain"
      })
    )
  );

  const onItemPress = () => props.bank.abi && props.onPress(props.bank.abi);
  const bankName = props.bank.name || I18n.t("wallet.searchAbi.noName");
  const bankLogo = (
    <View style={styles.boundaryImage}>
      {props.bank.logoUrl && imageDimensions && (
        <Image style={imageStyle} source={{ uri: props.bank.logoUrl }} />
      )}
    </View>
  );

  return (
    <PressableListItemBase onPress={onItemPress}>
      <View style={styles.listItem}>
        {bankLogo}
        <VSpacer size={8} />
        <LabelSmall color={"bluegrey"} weight={"Bold"}>
          {bankName}
        </LabelSmall>
      </View>
      <Icon name="chevronRightListItem" size={24} color="blue" />
    </PressableListItemBase>
  );
};

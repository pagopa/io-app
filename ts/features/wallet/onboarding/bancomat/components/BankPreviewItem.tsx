import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ListItem } from "native-base";
import * as React from "react";
import { View, Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
import { Abi } from "../../../../../../definitions/pagopa/walletv2/Abi";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import I18n from "../../../../../i18n";
import { useImageResize } from "../screens/hooks/useImageResize";
import { Icon } from "../../../../../components/core/icons/Icon";

type Props = {
  // TODO: change bank in info and use a generic type
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

  return props.inList ? (
    <ListItem style={styles.flexRow} onPress={onItemPress}>
      <View style={styles.listItem}>
        <VSpacer size={16} />
        {bankLogo}
        <VSpacer size={8} />
        <LabelSmall color={"bluegrey"} weight={"Bold"}>
          {bankName}
        </LabelSmall>
        <VSpacer size={16} />
      </View>
      <Icon name="chevronRightListItem" size={24} color="blue" />
    </ListItem>
  ) : (
    <ButtonDefaultOpacity
      white={true}
      style={styles.gridItem}
      onPress={onItemPress}
    >
      {bankLogo}
      <VSpacer size={16} />
      <LabelSmall color={"bluegrey"} weight={"Bold"}>
        {bankName}
      </LabelSmall>
    </ButtonDefaultOpacity>
  );
};

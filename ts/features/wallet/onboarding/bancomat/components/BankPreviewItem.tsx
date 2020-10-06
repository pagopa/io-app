import { fromNullable } from "fp-ts/lib/Option";
import { ListItem, View } from "native-base";
import * as React from "react";
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
import { Abi } from "../../../../../../definitions/pagopa/bancomat/Abi";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import IconFont from "../../../../../components/ui/IconFont";

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
  }
});

export const BankPreviewItem: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [imageW, setImageW] = React.useState(BASE_IMG_W);
  const [calculatedDim, setCalculatedDim] = React.useState(false);

  /**
   * To keep the image bounded in the predefined maximum dimensions (40x160) we use the resizeMode "contain"
   * and always calculate the resize width keeping fixed the height to 40, in this way all images will have an height of 40
   * and a variable width until the limit of 160.
   * Calculating the new image height based on its width may cause an over boundary dimension in some case.
   * @param width
   * @param height
   */
  const handleImageDimensionSuccess = (width: number, height: number) => {
    if (width > 0 && height > 0) {
      const newWidth = (width / height) * BASE_IMG_H;
      setImageW(newWidth > BASE_IMG_W ? BASE_IMG_W : newWidth);
      setCalculatedDim(true);
    }
  };

  React.useEffect(() => {
    fromNullable(props.bank.logoUrl).map(url =>
      Image.getSize(url, handleImageDimensionSuccess)
    );
  }, []);

  const imageStyle: StyleProp<ImageStyle> = {
    width: imageW,
    height: BASE_IMG_H,
    resizeMode: "contain"
  };

  const onItemPress = () => props.bank.abi && props.onPress(props.bank.abi);

  return props.inList ? (
    <ListItem style={styles.flexRow} onPress={onItemPress}>
      <View style={styles.listItem}>
        <View spacer={true} />
        {calculatedDim && props.bank.logoUrl && (
          <Image style={imageStyle} source={{ uri: props.bank.logoUrl }} />
        )}
        <View spacer={true} small={true} />
        <LabelSmall color={"bluegrey"} weight={"Bold"}>
          {props.bank.name ? props.bank.name : "Nome non trovato"}
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
      {calculatedDim && props.bank.logoUrl && (
        <Image style={imageStyle} source={{ uri: props.bank.logoUrl }} />
      )}
      <View spacer={true} />
      <LabelSmall color={"bluegrey"} weight={"Bold"}>
        {props.bank.name ? props.bank.name : "Nome non trovato"}
      </LabelSmall>
    </ButtonDefaultOpacity>
  );
};

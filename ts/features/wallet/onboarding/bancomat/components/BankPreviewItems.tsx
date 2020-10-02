import { ListItem, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import IconFont from "../../../../../components/ui/IconFont";

type Props = {
  bank: any;
  inList: boolean;
  onPress: () => void;
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

  const handleImageDimensionSuccess = (width: number, height: number) => {
    setImageW((width / height) * BASE_IMG_H);
  };

  React.useEffect(() => {
    Image.getSize(props.bank.logoUrl, handleImageDimensionSuccess);
  }, []);

  return props.inList ? (
    <ListItem style={styles.flexRow} onPress={props.onPress}>
      <View style={styles.listItem}>
        <Image
          style={{
            width: imageW,
            height: BASE_IMG_H,
            resizeMode: "contain"
          }}
          source={{ uri: props.bank.logoUrl }}
        />
        <View spacer={true} />
        <LabelSmall color={"bluegrey"} weight={"Bold"}>
          {props.bank.name}
        </LabelSmall>
      </View>
      <IconFont name={"io-right"} color={IOColors.blue} />
    </ListItem>
  ) : (
    <ButtonDefaultOpacity
      white={true}
      style={styles.gridItem}
      onPress={props.onPress}
    >
      <Image style={styles.imageStyle} source={{ uri: props.bank.logoUrl }} />
      <View spacer={true} />
      <LabelSmall color={"bluegrey"} weight={"Bold"}>
        {props.bank.name}
      </LabelSmall>
    </ButtonDefaultOpacity>
  );
};

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
  imageStyle: {
    width: 156,
    height: 30,
    resizeMode: "cover"
  }
});

export const BankPreviewItem: React.FunctionComponent<Props> = (props: Props) =>
  props.inList ? (
    <ListItem style={styles.flexRow} onPress={props.onPress}>
      <View style={styles.listItem}>
        <Image style={styles.imageStyle} source={{ uri: props.bank.logoUrl }} />
        <View spacer={true} />
        <LabelSmall color={"bluegrey"} weight={"SemiBold"}>
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
      <LabelSmall color={"bluegrey"} weight={"SemiBold"}>
        {props.bank.name}
      </LabelSmall>
    </ButtonDefaultOpacity>
  );

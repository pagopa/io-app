import { ListItem } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import customVariables from "../../../../../theme/variables";

type Props = {
  bank: any;
  inList: boolean;
  onPress: () => void;
};

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "column",
    flex: 1
  },
  gridItem: {
    margin: customVariables.gridGutter / 2,
    padding: 30,
    flexDirection: "column",
    flex: 1
  },
  imageStyle: {
    width: 156,
    height: 30,
    resizeMode: "cover"
  }
});

export const BankPreviewItem: React.FunctionComponent<Props> = (
  props: Props
) => (
  <ListItem
    style={props.inList ? styles.gridItem : styles.listItem}
    onPress={props.onPress}
  >
    <Image style={styles.imageStyle} source={{ uri: props.bank.logo_uri }} />
    <LabelSmall color={"bluegrey"} weight={"SemiBold"}>
      {props.bank.name}
    </LabelSmall>
  </ListItem>
);

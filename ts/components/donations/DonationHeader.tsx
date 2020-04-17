import { Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet, ViewProps } from "react-native";
import H5 from "../ui/H5";

type Props = Readonly<{
  departmentName: string;
  organizationName: string;
  imageSource: string;
}>;

const IMAGE_WIDTH = 60;
const IMAGE_HEIGHT = 48;

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  image: {
    resizeMode: "contain",
    height: IMAGE_HEIGHT,
    width: IMAGE_WIDTH,
    alignSelf: "flex-start"
  }
});

export default function DonationHeader(props: Props & ViewProps) {
  return (
    <View style={[props.style, styles.row]}>
      <View style={styles.flex}>
        <H5>{props.departmentName}</H5>
        <Text>{props.organizationName}</Text>
      </View>
      <Image source={{ uri: props.imageSource }} style={styles.image} />
    </View>
  );
}

import { Text as NBText } from "native-base";
import * as React from "react";
import { View, Image, ImageSourcePropType, StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import { VSpacer } from "../core/spacer/Spacer";

const styles = StyleSheet.create({
  view: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  title: {
    paddingTop: customVariables.contentPadding
  },
  subtitle: {
    textAlign: "center",
    paddingTop: customVariables.contentPadding
  }
});

type Props = Readonly<{
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
}>;

export const EmptyListComponent = (props: Props) => (
  <View style={styles.view}>
    <VSpacer size={16} />
    <Image source={props.image} />
    <NBText style={styles.title}>{props.title}</NBText>
    {props.subtitle && (
      <NBText style={styles.subtitle}>{props.subtitle}</NBText>
    )}
  </View>
);

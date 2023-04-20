import * as React from "react";
import { View, Image, ImageSourcePropType, StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import { VSpacer } from "../core/spacer/Spacer";
import { Body } from "../core/typography/Body";
import { IOStyles } from "../core/variables/IOStyles";

const styles = StyleSheet.create({
  view: {
    padding: customVariables.contentPadding
  }
});

type Props = Readonly<{
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
}>;

export const EmptyListComponent = (props: Props) => (
  <View style={[styles.view, IOStyles.alignCenter]}>
    <VSpacer size={16} />
    <Image source={props.image} />
    <VSpacer size={24} />
    <Body>{props.title}</Body>
    {props.subtitle && (
      <View style={IOStyles.alignCenter}>
        <VSpacer size={24} />
        <Body>{props.subtitle}</Body>
      </View>
    )}
  </View>
);

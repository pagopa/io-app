import React from "react";
import { View, StyleSheet } from "react-native";
import { VSpacer, IOPictograms, Pictogram } from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";

const styles = StyleSheet.create({
  view: {
    padding: customVariables.contentPadding
  }
});

type Props = Readonly<{
  pictogram: IOPictograms;
  title: string;
  subtitle?: string;
}>;

export const EmptyListComponent = (props: Props) => (
  <View style={[styles.view, IOStyles.alignCenter]}>
    <VSpacer size={16} />
    <Pictogram name={props.pictogram} />
    <VSpacer size={24} />
    <Body weight="SemiBold">{props.title}</Body>
    {props.subtitle && (
      <>
        <VSpacer size={24} />
        <Body style={{ textAlign: "center" }}>{props.subtitle}</Body>
      </>
    )}
  </View>
);

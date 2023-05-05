import * as React from "react";
import { View, StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import { VSpacer } from "../core/spacer/Spacer";
import { Body } from "../core/typography/Body";
import { IOStyles } from "../core/variables/IOStyles";
import { IOPictogramType, Pictogram } from "../core/pictograms";

const styles = StyleSheet.create({
  view: {
    padding: customVariables.contentPadding
  }
});

type Props = Readonly<{
  pictogram: IOPictogramType;
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

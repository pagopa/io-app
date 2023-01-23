import * as React from "react";
import { Text as NBText, View } from "native-base";
import { StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import { IOPictogramType, Pictogram } from "../core/pictograms";

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
  picture: IOPictogramType;
  title: string;
  subtitle?: string;
}>;

export const EmptyListComponent = ({ picture, title, subtitle }: Props) => (
  <View style={styles.view}>
    <View spacer={true} />
    <Pictogram name={picture} size={120} />
    <NBText style={styles.title}>{title}</NBText>
    {subtitle && <NBText style={styles.subtitle}>{subtitle}</NBText>}
  </View>
);

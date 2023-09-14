import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  H3,
  IOPictograms,
  LabelSmall,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    marginHorizontal: 16
  },
  text: {
    textAlign: "center"
  }
});

type Props = {
  pictogram: IOPictograms;
  title: string;
  subtitle?: string;
};

export const MessageFeedback = ({ pictogram, title, subtitle }: Props) => (
  <View style={styles.container}>
    <Pictogram name={pictogram} size={120} />
    <VSpacer size={24} />
    <H3 style={styles.text}>{title}</H3>
    {subtitle && (
      <>
        <VSpacer size={8} />
        <LabelSmall style={styles.text} color="grey-650" weight="Regular">
          {subtitle}
        </LabelSmall>
      </>
    )}
  </View>
);

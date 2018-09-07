import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import variables from "../theme/variables";

const styles = StyleSheet.create({
  content: {
    backgroundColor: variables.brandPrimary,
    padding: variables.contentPadding
  }
});

interface Props {
  title: string;
  message: string;
}

export const AlertBanner: React.SFC<Props> = ({ title, message }) => (
  <View style={styles.content}>
    <Text white={true} bold={true}>
      {title}
    </Text>
    <Text white={true}>{message}</Text>
  </View>
);

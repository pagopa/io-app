import React from "react";
import { StyleSheet, View } from "react-native";
import { gap } from "../../utils";

const styles = StyleSheet.create({
  tagWrapper: {
    marginHorizontal: gap / 2,
    marginVertical: gap / 2
  }
});

export type MessageDetailsTagBoxProps = {
  children: React.ReactNode;
};

export const MessageDetailsTagBox = ({
  children
}: MessageDetailsTagBoxProps) => (
  <View style={styles.tagWrapper}>{children}</View>
);

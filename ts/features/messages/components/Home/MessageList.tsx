import React from "react";
import { StyleSheet, View } from "react-native";
import { Body } from "@pagopa/io-app-design-system";
import { MessageListCategory } from "../../types/messageListCategory";

const styles = StyleSheet.create({
  tempPagerViewContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  }
});

type MessageListProps = {
  category: MessageListCategory;
};

export const MessageList = ({ category }: MessageListProps) => (
  <View collapsable={false} style={styles.tempPagerViewContainer}>
    <Body>{`${category} in sviluppo`}</Body>
  </View>
);

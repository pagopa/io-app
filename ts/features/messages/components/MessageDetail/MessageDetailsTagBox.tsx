import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { gapBetweenItemsInAGrid } from "../../utils";

const styles = StyleSheet.create({
  tagWrapper: {
    justifyContent: "center",
    marginHorizontal: gapBetweenItemsInAGrid / 2,
    marginVertical: gapBetweenItemsInAGrid / 2
  }
});

export type MessageDetailsTagBoxProps = {
  children: ReactNode;
};

export const MessageDetailsTagBox = ({
  children
}: MessageDetailsTagBoxProps) => (
  <View style={styles.tagWrapper}>{children}</View>
);

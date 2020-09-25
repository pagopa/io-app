import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { CheckBox } from "../../components/core/selection/CheckBox";
import { ShowroomSection } from "./ShowroomSection";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly"
  }
});

export const SelectionShowroom = () => (
  <ShowroomSection title={"Selection"}>
    <View style={styles.content}>
      <CheckBox />
      <CheckBox checked={true} />
    </View>
  </ShowroomSection>
);

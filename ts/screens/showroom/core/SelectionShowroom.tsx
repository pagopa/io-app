import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { CheckBox } from "../../../components/core/selection/CheckBox";
import { Label } from "../../../components/core/typography/Label";
import { ShowroomSection } from "../ShowroomSection";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly"
  }
});

export const SelectionShowroom = () => {
  const [cbState, setCbState] = React.useState({ cb1: false, cb2: true });
  return (
    <ShowroomSection title={"Selection"}>
      <Label>{"<CheckBox />"}</Label>
      <View style={styles.content}>
        <CheckBox
          checked={cbState.cb1}
          onPress={() => setCbState(ov => ({ ...ov, cb1: !ov.cb1 }))}
        />
        <CheckBox
          checked={cbState.cb2}
          onPress={() => setCbState(ov => ({ ...ov, cb2: !ov.cb2 }))}
        />
      </View>
    </ShowroomSection>
  );
};

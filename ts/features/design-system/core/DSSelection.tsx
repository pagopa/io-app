import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { CheckBox } from "../../../components/core/selection/checkbox/CheckBox";
import { RemoteSwitch } from "../../../components/core/selection/RemoteSwitch";
import { Label } from "../../../components/core/typography/Label";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { H2 } from "../../../components/core/typography/H2";
import { CheckboxLabel } from "../../../components/core/selection/checkbox/CheckboxLabel";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { VSpacer } from "../../../components/core/spacer/Spacer";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    paddingVertical: 16
  }
});

export const DSSelection = () => (
  <DesignSystemScreen title={"Selection"}>
    <H2>Checkbox</H2>
    <VSpacer size={16} />
    <DSComponentViewerBox name="CheckboxLabel">
      <CheckboxLabel label="This is a test" />
      <VSpacer size={16} />
      <CheckboxLabel disabled checked={true} label="This is a test" />
      <VSpacer size={16} />
      <CheckboxLabel disabled label="This is a test" />
    </DSComponentViewerBox>
    <Label>{"<CheckBox />"}</Label>
    <View style={styles.content}>
      <CheckBox />
      <CheckBox checked={true} />
    </View>
    <Label>{"<RemoteSwitch />"}</Label>
    <View style={styles.content}>
      <RemoteSwitch value={pot.none} />
      <RemoteSwitch
        value={pot.noneError(new Error())}
        onRetry={() => Alert.alert("Retry!")}
      />
      <RemoteSwitch value={pot.some(true)} />
      <RemoteSwitch value={pot.someUpdating(false, true)} />
      <RemoteSwitch value={pot.some(false)} />
      <RemoteSwitch value={pot.someUpdating(true, false)} />
    </View>
  </DesignSystemScreen>
);

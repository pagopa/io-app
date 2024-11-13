import { H6, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";

import * as pot from "@pagopa/ts-commons/lib/pot";
import { RemoteSwitch } from "../../../components/core/selection/RemoteSwitch";
import { CheckBox } from "../../../components/core/selection/checkbox/CheckBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

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

export const DSLegacySelection = () => (
  <DesignSystemScreen title={"Legacy Selection"}>
    <H6>{"<CheckBox />"}</H6>
    <View style={styles.content}>
      <CheckBox />
      <CheckBox checked={true} />
    </View>
    <H6>{"<RemoteSwitch />"}</H6>
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
      <VSpacer size={48} />
    </View>
  </DesignSystemScreen>
);

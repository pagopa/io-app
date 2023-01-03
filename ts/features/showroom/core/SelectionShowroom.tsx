import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { CheckBox } from "../../../components/core/selection/checkbox/CheckBox";
import { RemoteSwitch } from "../../../components/core/selection/RemoteSwitch";
import { Label } from "../../../components/core/typography/Label";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

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

export const SelectionShowroom = () => (
  <BaseScreenComponent goBack={true} headerTitle={"Selection"}>
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);

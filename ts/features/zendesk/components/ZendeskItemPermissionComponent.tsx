import { HSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";

/**
 * id is optional since some items should recognized since they can be removed from the whole list
 * i.e: items about profile || payment
 */
export type ItemPermissionProps = {
  id?: string;
  icon: React.ReactNode;
  title: string;
  value?: string;
  zendeskId?: string;
  testId: string;
};

const ZendeskItemPermissionComponent = (props: ItemPermissionProps) => (
  <View
    testID={props.testId}
    style={{
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      // Hacky solution waiting for the replacement with `ListItem` from the DS
      paddingVertical: 16
    }}
  >
    <View>{props.icon}</View>
    <HSpacer size={16} />
    <View style={{ flex: 1, flexDirection: "column" }}>
      <H4>{props.title}</H4>
      {props.value && <H5 weight={"Regular"}>{props.value}</H5>}
    </View>
  </View>
);

export default ZendeskItemPermissionComponent;

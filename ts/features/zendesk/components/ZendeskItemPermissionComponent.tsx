import { ListItem } from "native-base";
import { View } from "react-native";
import * as React from "react";
import { HSpacer } from "../../../components/core/spacer/Spacer";
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
  <ListItem testID={props.testId}>
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <View>{props.icon}</View>
      <HSpacer size={16} />
      <View style={{ flex: 1, flexDirection: "column" }}>
        <H4>{props.title}</H4>
        {props.value && <H5 weight={"Regular"}>{props.value}</H5>}
      </View>
    </View>
  </ListItem>
);

export default ZendeskItemPermissionComponent;

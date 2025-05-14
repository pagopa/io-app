import { Pressable, Text } from "react-native";
import { ListItemMessageProps } from "../ListItemMessage";

export const ListItemMessage = (props: ListItemMessageProps) => (
  <Pressable
    accessibilityRole={props.accessibilityRole}
    onLongPress={props.onLongPress}
    onPress={props.onPress}
    testID={props.testID}
  >
    <>
      <Text>{props.accessibilityLabel}</Text>
      <Text>{props.accessibilityRole}</Text>
      <Text>{`${props.avatarDouble}`}</Text>
      <Text>{props.formattedDate}</Text>
      <Text>{props.isRead}</Text>
      <Text>{props.messageTitle}</Text>
      <Text>{props.organizationName}</Text>
      <Text>{`${props.selected}`}</Text>
      <Text>{`${JSON.stringify(props.serviceLogos)}`}</Text>
      <Text>{props.serviceName}</Text>
      <Text>{`${JSON.stringify(props.tag)}`}</Text>
      <Text>{`${JSON.stringify(props.testID)}`}</Text>
    </>
  </Pressable>
);

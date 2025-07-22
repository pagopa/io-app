import { Text } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

export const SendQrScanPushEngagementScreen = () => (
  <OperationResultScreenContent
    pictogram="notification"
    title="Mock Title"
    subtitle=" Minim aliqua est officia minim fugiat duis officia excepteur esse voluptate nulla consequat incididunt deserunt. Qui veniam fugiat non duis labore ut. Laborum aute aliquip consequat occaecat tempor voluptate. Ullamco deserunt sint proident nulla dolore quis sint sunt ea ex exercitation. "
    topElement={<Text>Mock_Top_Element</Text>}
    action={{ label: "ATTIVA NOTIFICHE", onPress: () => null }}
  />
);

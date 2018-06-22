import { ViewProperties, GestureResponderEvent } from "react-native";

declare module "react-native-easy-grid" {
  export interface RowProps extends ViewProperties {
    onPress?: (event: GestureResponderEvent) => void;
  }
  export interface ColProps extends ViewProperties {
    onPress?: (event: GestureResponderEvent) => void;
  }
}

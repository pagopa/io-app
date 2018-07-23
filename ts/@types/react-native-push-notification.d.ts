import PushNotification from "react-native-push-notification";

declare module "react-native-push-notification" {
  export interface PushNotification {
    message_id: string;
  }
}

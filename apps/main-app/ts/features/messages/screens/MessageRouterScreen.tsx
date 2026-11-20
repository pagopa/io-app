import { useEffect } from "react";

import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { trackOpenMessageFromSuccessData } from "../analytics";
import { MessageDetailsSkeleton } from "../components/MessageDetail/MessageDetailsSkeleton";
import { MessageRouterScreenErrorComponent } from "../components/MessageRouter/MessageRouterScreenErrorComponent";
import { useLoadMessageData } from "../hooks/useLoadMessageData";
import { MessageContentNavigator } from "../navigation/MessageContentNavigator";
import { MessagesParamsList } from "../navigation/params";
import { MESSAGES_ROUTES } from "../navigation/routes";

export type MessageRouterScreenRouteParams = {
  fromNotification: boolean;
  messageId: string;
};

type MessageRouterScreenProps = IOStackNavigationRouteProps<
  MessagesParamsList,
  "MESSAGE_ROUTER"
>;

export const MessageRouterScreen = ({ route }: MessageRouterScreenProps) => {
  const { messageId, fromNotification } = route.params;
  const navigation = useIONavigation();
  const { status, retry } = useLoadMessageData(messageId, fromNotification);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    headerShown: status.status !== "success"
  });

  // Messages with preconditions are never shown from a push notification: the
  // user has to open them from the inbox, where preconditions are shown first
  const isBlocked = status.status === "blocked";
  useEffect(() => {
    if (isBlocked) {
      navigation.navigate(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
    }
  }, [isBlocked, navigation]);

  const successData =
    status.status === "success" ? status.successData : undefined;
  useEffect(() => {
    if (successData !== undefined) {
      trackOpenMessageFromSuccessData(successData, fromNotification);
    }
  }, [fromNotification, successData]);

  switch (status.status) {
    case "error":
      return (
        <MessageRouterScreenErrorComponent
          messageId={messageId}
          onCancel={navigation.goBack}
          onRetry={retry}
        />
      );
    case "success":
      return <MessageContentNavigator message={status.successData} />;
    default:
      return <MessageDetailsSkeleton />;
  }
};

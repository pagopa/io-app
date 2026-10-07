import I18n from "i18next";
import { useEffect } from "react";

import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../store/hooks";
import { trackOpenMessageFromSuccessData } from "../analytics";
import { MessageContentParamsList } from "../navigation/params";
import { loadedMessageDataSelector } from "../store/reducers/messageGetStatus";

export type MessageGreenPassScreenRouteParams = {
  fromPushNotification: boolean;
  messageId: string;
};

type MessageGreenPassScreenProps = IOStackNavigationRouteProps<
  MessageContentParamsList,
  "MESSAGE_GREEN_PASS"
>;

export const MessageGreenPassScreen = ({
  route
}: MessageGreenPassScreenProps) => {
  const { fromPushNotification, messageId } = route.params;
  const navigation = useIONavigation();
  const store = useIOStore();

  useEffect(() => {
    const messageData = loadedMessageDataSelector(store.getState(), messageId);
    if (messageData !== undefined) {
      trackOpenMessageFromSuccessData(messageData, fromPushNotification);
    }
  }, [fromPushNotification, messageId, store]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("features.greenPass.button"),
        onPress: navigation.goBack,
        testID: "green-pass-button"
      }}
      isHeaderVisible
      pictogram="attention"
      title={I18n.t("features.greenPass.title")}
    />
  );
};

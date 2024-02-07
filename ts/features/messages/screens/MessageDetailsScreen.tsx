import React, { useCallback } from "react";
import { ScrollView } from "react-native";
import { ContentWrapper } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UIMessageId } from "../types";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessagesParamsList } from "../navigation/params";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { MessageDetailsAttachments } from "../components/MessageDetail/MessageDetailsAttachments";
import { useIODispatch } from "../../../store/hooks";
import { cancelPreviousAttachmentDownload } from "../store/actions";

export type MessageDetailsScreenNavigationParams = {
  messageId: UIMessageId;
  serviceId: ServiceId;
};

export const MessageDetailsScreen = (
  props: IOStackNavigationRouteProps<MessagesParamsList, "MESSAGE_DETAIL">
) => {
  const messageId = props.route.params.messageId;
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const goBack = useCallback(() => {
    dispatch(cancelPreviousAttachmentDownload());
    navigation.goBack();
  }, [dispatch, navigation]);
  useHeaderSecondLevel({
    title: "",
    goBack,
    supportRequest: true
  });
  return (
    <SafeAreaView edges={["bottom"]}>
      <ScrollView>
        <ContentWrapper>
          <MessageDetailsAttachments messageId={messageId} />
        </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  );
};

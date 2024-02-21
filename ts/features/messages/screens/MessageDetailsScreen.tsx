import React, { useCallback } from "react";
import { ScrollView } from "react-native";
import {
  ContentWrapper,
  IOStyles,
  Tag,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { UIMessageId } from "../types";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessagesParamsList } from "../navigation/params";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { cancelPreviousAttachmentDownload } from "../store/actions";
import { getPaginatedMessageById } from "../store/reducers/paginatedById";
import {
  hasAttachmentsSelector,
  messageTitleSelector
} from "../store/reducers/thirdPartyById";
import { MessageDetailsAttachments } from "../components/MessageDetail/MessageDetailsAttachments";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { MessageDetailsHeader } from "../components/MessageDetail/MessageDetailsHeader";
import I18n from "../../../i18n";
import {
  messageDetailsByIdSelector,
  messageDetailsExpiringInfoSelector
} from "../store/reducers/detailsById";
import { localeDateFormat } from "../../../utils/locale";
import { MessageDetailsTagBox } from "../components/MessageDetail/MessageDetailsTagBox";
import { MessageDetailsReminder } from "../components/MessageDetail/MessageDetailsReminder";

export type MessageDetailsScreenNavigationParams = {
  messageId: UIMessageId;
  serviceId: ServiceId;
};

type MessageDetailsRouteProps = RouteProp<MessagesParamsList, "MESSAGE_DETAIL">;

export const MessageDetailsScreen = () => {
  const { params } = useRoute<MessageDetailsRouteProps>();
  const { messageId, serviceId } = params;

  const navigation = useIONavigation();

  const dispatch = useIODispatch();

  const message = pipe(
    useIOSelector(state => getPaginatedMessageById(state, messageId)),
    pot.toOption,
    O.toUndefined
  );

  const messageDetails = pipe(
    useIOSelector(state => messageDetailsByIdSelector(state, messageId)),
    pot.toOption,
    O.toUndefined
  );

  const hasAttachments = useIOSelector(state =>
    hasAttachmentsSelector(state, messageId)
  );

  const subject =
    useIOSelector(state => messageTitleSelector(state, messageId)) ?? "";

  const expiringInfo = useIOSelector(state =>
    messageDetailsExpiringInfoSelector(state, messageId, Date.now())
  );

  const goBack = useCallback(() => {
    dispatch(cancelPreviousAttachmentDownload());
    navigation.goBack();
  }, [dispatch, navigation]);

  useHeaderSecondLevel({
    title: "",
    goBack,
    supportRequest: true
  });

  if (message === undefined || messageDetails === undefined) {
    return (
      <OperationResultScreenContent
        pictogram={"umbrellaNew"}
        title={I18n.t("global.genericError")}
        subtitle={I18n.t("messageDetails.submitBugText")}
      />
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
      <ScrollView>
        <MessageDetailsHeader
          serviceId={serviceId}
          subject={subject}
          createdAt={message.createdAt}
        >
          {hasAttachments && (
            <MessageDetailsTagBox>
              <Tag
                variant="attachment"
                testID="attachment-tag"
                iconAccessibilityLabel={I18n.t(
                  "messageDetails.accessibilityAttachmentIcon"
                )}
              />
            </MessageDetailsTagBox>
          )}
          {messageDetails.dueDate && expiringInfo === "expired" && (
            <MessageDetailsTagBox>
              <Tag
                text={I18n.t("features.messages.badge.dueDate", {
                  date: localeDateFormat(
                    messageDetails.dueDate,
                    I18n.t("global.dateFormats.dayMonthWithoutTime")
                  ),
                  time: localeDateFormat(
                    messageDetails.dueDate,
                    I18n.t("global.dateFormats.timeFormat")
                  )
                })}
                variant="error"
                testID="due-date-tag"
              />
            </MessageDetailsTagBox>
          )}
        </MessageDetailsHeader>

        {messageDetails.dueDate && expiringInfo === "expiring" && (
          <ContentWrapper>
            <VSpacer size={8} />
            <MessageDetailsReminder
              dueDate={messageDetails.dueDate}
              messageId={messageId}
              title={subject}
            />
          </ContentWrapper>
        )}

        <VSpacer size={16} />
        <ContentWrapper>
          <MessageDetailsAttachments messageId={messageId} />
        </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  );
};

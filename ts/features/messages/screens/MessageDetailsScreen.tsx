import React, { useCallback, useMemo } from "react";
import { ScrollView } from "react-native";
import {
  Alert,
  ContentWrapper,
  IOStyles,
  Tag,
  VSpacer
} from "@pagopa/io-app-design-system";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { SafeAreaView } from "react-native-safe-area-context";
import { UIMessageId } from "../types";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { MessagesParamsList } from "../navigation/params";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { cancelPreviousAttachmentDownload } from "../store/actions";
import { getPaginatedMessageById } from "../store/reducers/paginatedById";
import {
  hasAttachmentsSelector,
  messageMarkdownSelector,
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
import { MessageMarkdown } from "../components/MessageDetail/MessageMarkdown";
import { cleanMarkdownFromCTAs } from "../utils/messages";

export type MessageDetailsScreenNavigationParams = {
  messageId: UIMessageId;
  serviceId: ServiceId;
};

export const MessageDetailsScreen = (
  props: IOStackNavigationRouteProps<MessagesParamsList, "MESSAGE_DETAIL">
) => {
  const { messageId, serviceId } = props.route.params;
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

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

  const messageMarkdown =
    useIOSelector(state => messageMarkdownSelector(state, messageId)) ?? "";
  const markdownWithNoCTA = useMemo(
    () => cleanMarkdownFromCTAs(messageMarkdown),
    [messageMarkdown]
  );

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
        <ContentWrapper>
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
            <>
              <VSpacer size={8} />
              <Alert
                testID="due-date-alert"
                variant="warning"
                action={I18n.t("features.messages.alert.action")}
                onPress={constNull}
                content={I18n.t("features.messages.alert.content", {
                  date: localeDateFormat(
                    messageDetails.dueDate,
                    I18n.t("global.dateFormats.shortFormat")
                  ),
                  time: localeDateFormat(
                    messageDetails.dueDate,
                    I18n.t("global.dateFormats.timeFormat")
                  )
                })}
              />
            </>
          )}
          <VSpacer />
          <MessageMarkdown>{markdownWithNoCTA}</MessageMarkdown>
          <VSpacer />
          <MessageDetailsAttachments messageId={messageId} />
        </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  );
};

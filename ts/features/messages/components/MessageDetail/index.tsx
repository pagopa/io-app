import { IOStyles, LabelSmall, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";
import { ServiceMetadata } from "../../../../../definitions/backend/ServiceMetadata";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { H1 } from "../../../../components/core/typography/H1";
import { H2 } from "../../../../components/core/typography/H2";
import OrganizationHeader from "../../../../components/OrganizationHeader";
import StatusContent from "../../../../components/SectionStatus/StatusContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { UIService } from "../../../../store/reducers/entities/services/types";
import variables from "../../../../theme/variables";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import {
  messageMarkdownSelector,
  messageTitleSelector,
  thirdPartyFromIdSelector
} from "../../store/reducers/thirdPartyById";
import { UIMessage, UIMessageDetails, UIMessageId } from "../../types";
import { cleanMarkdownFromCTAs } from "../../utils/messages";
import MessageContent from "./Content";
import CtaBar from "./CtaBar";
import { HeaderDueDateBar } from "./HeaderDueDateBar";
import { LegacyMessageAttachments } from "./LegacyMessageAttachments";
import { LegacyRemoteContentBanner } from "./LegacyRemoteContentBanner";
import { MessageMarkdown } from "./MessageMarkdown";

const styles = StyleSheet.create({
  webview: {
    marginHorizontal: variables.contentPadding
  },
  attachmentsTitle: {
    paddingHorizontal: variables.spacerLargeHeight,
    marginBottom: variables.spacerHeight
  }
});

type Props = Readonly<{
  hasPaidBadge: boolean;
  message: UIMessage;
  messageDetails: UIMessageDetails;
  onServiceLinkPress?: () => void;
  organizationFiscalCode?: OrganizationFiscalCode;
  serviceMetadata?: ServiceMetadata;
  service?: UIService;
}>;

const OrganizationTitle = ({ name, organizationName, logoURLs }: UIService) => (
  <OrganizationHeader
    serviceName={name}
    organizationName={organizationName}
    logoURLs={logoURLs}
  />
);

const renderThirdPartyAttachmentsError = () => (
  <>
    <StatusContent
      backgroundColor={"orange"}
      foregroundColor={"white"}
      iconName={"notice"}
      labelPaddingVertical={16}
    >
      <LabelSmall weight="Regular" color="white" style={{ paddingStart: 16 }}>
        {I18n.t("messageDetails.attachments.unavailable.firstPart")}
        <LabelSmall weight="Bold" color="white">
          {I18n.t("messageDetails.attachments.unavailable.secondPart")}
        </LabelSmall>
        {I18n.t("messageDetails.attachments.unavailable.thirdPart")}
      </LabelSmall>
    </StatusContent>
    <VSpacer size={24} />
  </>
);

const renderThirdPartyAttachmentsLoading = () => (
  <>
    <ActivityIndicator
      size={"large"}
      color={variables.brandPrimary}
      accessible={true}
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      importantForAccessibility={"no-hide-descendants"}
    />
    <VSpacer size={24} />
  </>
);

/**
 * Render a single message with all of its details
 */
const MessageDetailsComponent = ({
  hasPaidBadge,
  message,
  messageDetails,
  onServiceLinkPress,
  service,
  serviceMetadata
}: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  // This is used to make sure that no attachments are shown before the
  // markdown content has rendered
  const [isContentLoadCompleted, setIsContentLoadCompleted] = useState(false);
  const { markdown, hasRemoteContent } = messageDetails;

  const { id: messageId, title } = message;
  const thirdPartyDataPot = useIOSelector(state =>
    thirdPartyFromIdSelector(state, messageId)
  );
  const hasThirdPartyDataAttachments = pipe(
    thirdPartyDataPot,
    pot.toOption,
    O.chainNullableK(
      thirdPartyData => thirdPartyData.third_party_message.attachments
    ),
    O.map(RA.isNonEmpty),
    O.getOrElse(() => false)
  );

  const messageMarkdown =
    useIOSelector(state => messageMarkdownSelector(state, messageId)) ??
    markdown;

  const messageTitle =
    useIOSelector(state => messageTitleSelector(state, messageId)) ?? title;

  const serviceIdOpt = service?.id;
  const openAttachment = useCallback(
    (attachment: ThirdPartyAttachment) => {
      navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
        params: {
          messageId,
          serviceId: serviceIdOpt,
          attachmentId: attachment.id
        }
      });
    },
    [messageId, navigation, serviceIdOpt]
  );

  const renderThirdPartyAttachments = useCallback(
    (
      messageId: UIMessageId,
      thirdPartyMessage: ThirdPartyMessageWithContent
    ) => {
      // In order not to break or refactor existing PN code, the backend
      // model for third party attachments is converted into in-app
      // model for attachments when the user generates the request. This
      // is not a speed intensive operation nor a memory consuming task,
      // since the attachment count should be negligible
      const attachmentsOpt = thirdPartyMessage.third_party_message.attachments;
      return attachmentsOpt ? (
        <View style={IOStyles.horizontalContentPadding}>
          <LegacyMessageAttachments
            attachments={attachmentsOpt}
            messageId={messageId}
            openPreview={openAttachment}
          />
        </View>
      ) : (
        renderThirdPartyAttachmentsError()
      );
    },
    [openAttachment]
  );

  return (
    <>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
          <VSpacer size={16} />

          {service && <OrganizationTitle {...service} />}

          <VSpacer size={24} />

          <H1>{messageTitle}</H1>

          <VSpacer size={24} />
        </View>
        <HeaderDueDateBar
          hasPaidBadge={hasPaidBadge}
          messageDetails={messageDetails}
        />

        <MessageMarkdown
          webViewStyle={styles.webview}
          onLoadEnd={() => {
            setIsContentLoadCompleted(true);
          }}
        >
          {cleanMarkdownFromCTAs(messageMarkdown)}
        </MessageMarkdown>
        <VSpacer size={24} />

        {hasRemoteContent && isContentLoadCompleted ? (
          <>
            <LegacyRemoteContentBanner />
            <VSpacer size={24} />
          </>
        ) : null}

        {hasThirdPartyDataAttachments && isContentLoadCompleted && (
          <>
            <H2 color="bluegrey" style={styles.attachmentsTitle}>
              {I18n.t("features.pn.details.attachmentsSection.title")}
            </H2>
            {pot.fold(
              thirdPartyDataPot,
              () => (
                <></>
              ),
              () => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsError(),
              thirdPartyMessage =>
                renderThirdPartyAttachments(messageId, thirdPartyMessage),
              _ => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsError()
            )}
          </>
        )}
        {isContentLoadCompleted && (
          <MessageContent
            message={message}
            serviceContacts={{
              phone: serviceMetadata?.phone,
              email: serviceMetadata?.email
            }}
            goToServiceDetail={onServiceLinkPress}
          />
        )}
      </ScrollView>

      <CtaBar
        isPaid={hasPaidBadge}
        messageDetails={messageDetails}
        service={service}
        serviceMetadata={serviceMetadata}
      />
    </>
  );
};

export default MessageDetailsComponent;

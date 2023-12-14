import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IOColors, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../i18n";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";
import { ServiceMetadata } from "../../../../definitions/backend/ServiceMetadata";
import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";
import { LegacyMessageAttachments } from "../../../features/messages/components/LegacyMessageAttachments";
import { useIOSelector } from "../../../store/hooks";
import {
  messageMarkdownSelector,
  messageTitleSelector,
  thirdPartyFromIdSelector
} from "../../../store/reducers/entities/messages/thirdPartyById";

import {
  UIAttachment,
  UIMessage,
  UIMessageDetails
} from "../../../store/reducers/entities/messages/types";
import { attachmentsFromThirdPartyMessage } from "../../../store/reducers/entities/messages/transformers";
import { UIService } from "../../../store/reducers/entities/services/types";
import variables from "../../../theme/variables";
import { cleanMarkdownFromCTAs } from "../../../utils/messages";
import OrganizationHeader from "../../OrganizationHeader";
import { H2 } from "../../core/typography/H2";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import StatusContent from "../../SectionStatus/StatusContent";
import CtaBar from "./common/CtaBar";
import { RemoteContentBanner } from "./common/RemoteContentBanner";
import { HeaderDueDateBar } from "./common/HeaderDueDateBar";
import { MessageTitle } from "./common/MessageTitle";
import MessageContent from "./Content";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MessageMarkdown from "./MessageMarkdown";

const styles = StyleSheet.create({
  webview: {
    marginHorizontal: variables.contentPadding
  },
  attachmentsTitle: {
    paddingHorizontal: variables.spacerLargeHeight,
    marginBottom: variables.spacerHeight
  },
  message: {
    paddingStart: variables.spacerWidth,
    color: IOColors.white,
    font: "TitilliumWeb",
    fontSize: variables.headerBodyFontSize
  },
  messageBold: {
    fontWeight: "bold"
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
      <Text style={styles.message}>
        {I18n.t("messageDetails.attachments.unavailable.firstPart")}
        <Text style={styles.messageBold}>
          {I18n.t("messageDetails.attachments.unavailable.secondPart")}
        </Text>
        {I18n.t("messageDetails.attachments.unavailable.thirdPart")}
      </Text>
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
  // Note that it is not possibile for a message to have both medical
  // prescription attachments and third party data. That is why, later in the
  // code, the UI rendering is guarded by opposite checks on prescription and
  // third party attachments
  const {
    prescriptionAttachments,
    markdown,
    prescriptionData,
    hasRemoteContent
  } = messageDetails;
  const isPrescription = prescriptionData !== undefined;

  const { id: messageId, title } = message;
  const thirdPartyDataPot = useIOSelector(state =>
    thirdPartyFromIdSelector(state, messageId)
  );
  const thirdPartyMessagePotOrUndefined = pot.toUndefined(thirdPartyDataPot);
  const hasThirdPartyDataAttachments =
    !!thirdPartyMessagePotOrUndefined?.third_party_message.attachments;

  const messageMarkdown =
    useIOSelector(state => messageMarkdownSelector(state, messageId)) ??
    markdown;

  const messageTitle =
    useIOSelector(state => messageTitleSelector(state, messageId)) ?? title;

  const openAttachment = useCallback(
    (attachment: UIAttachment) => {
      navigation.navigate(ROUTES.MESSAGES_NAVIGATOR, {
        screen: ROUTES.MESSAGE_DETAIL_ATTACHMENT,
        params: {
          messageId,
          attachmentId: attachment.id
        }
      });
    },
    [messageId, navigation]
  );

  const renderThirdPartyAttachments = useCallback(
    (thirdPartyMessage: ThirdPartyMessageWithContent): React.ReactNode => {
      // In order not to break or refactor existing PN code, the backend
      // model for third party attachments is converted into in-app
      // model for attachments when the user generates the request. This
      // is not a speed intensive operation nor a memory consuming task,
      // since the attachment count should be negligible
      const maybeThirdPartyMessageAttachments =
        attachmentsFromThirdPartyMessage(thirdPartyMessage);
      return O.isSome(maybeThirdPartyMessageAttachments) ? (
        <View style={IOStyles.horizontalContentPadding}>
          <LegacyMessageAttachments
            attachments={maybeThirdPartyMessageAttachments.value}
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

          <MessageTitle title={messageTitle} isPrescription={isPrescription} />

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

        {prescriptionAttachments &&
          !hasThirdPartyDataAttachments &&
          isContentLoadCompleted && (
            <>
              <MedicalPrescriptionAttachments
                prescriptionData={prescriptionData}
                prescriptionAttachments={prescriptionAttachments}
                organizationName={message.organizationName}
              />
              <VSpacer size={24} />
            </>
          )}

        {hasRemoteContent && isContentLoadCompleted ? (
          <>
            <RemoteContentBanner />
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
                renderThirdPartyAttachments(thirdPartyMessage),
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

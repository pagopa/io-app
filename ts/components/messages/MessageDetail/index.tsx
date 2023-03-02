import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { Content as NBContent } from "native-base";
import * as React from "react";
import * as O from "fp-ts/lib/Option";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import I18n from "../../../i18n";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";
import { ServiceMetadata } from "../../../../definitions/backend/ServiceMetadata";
import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";
import { MessageAttachments } from "../../../features/messages/components/MessageAttachments";
import { loadThirdPartyMessage } from "../../../features/messages/store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { thirdPartyFromIdSelector } from "../../../store/reducers/entities/messages/thirdPartyById";
import {
  UIAttachment,
  UIMessage,
  UIMessageDetails
} from "../../../store/reducers/entities/messages/types";
import { attachmentsFromThirdPartyMessage } from "../../../store/reducers/entities/messages/transformers";
import { UIService } from "../../../store/reducers/entities/services/types";
import variables from "../../../theme/variables";
import { cleanMarkdownFromCTAs } from "../../../utils/messages";
import { VSpacer } from "../../core/spacer/Spacer";
import OrganizationHeader from "../../OrganizationHeader";
import { H2 } from "../../core/typography/H2";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { isStrictNone } from "../../../utils/pot";
import StatusContent from "../../SectionStatus/StatusContent";
import { IOColors } from "../../core/variables/IOColors";
import CtaBar from "./common/CtaBar";
import { HeaderDueDateBar } from "./common/HeaderDueDateBar";
import { MessageTitle } from "./common/MessageTitle";
import MessageContent from "./Content";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MessageMarkdown from "./MessageMarkdown";

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
  },
  webview: {
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding
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

const renderThirdPartyAttachmentsError = (viewRef: React.RefObject<View>) => (
  <>
    <StatusContent
      backgroundColor={"orange"}
      iconColor={IOColors.white}
      iconName={"io-notice"}
      labelColor={"white"}
      viewRef={viewRef}
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
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const viewRef = React.createRef<View>();
  // This is used to make sure that no attachments are shown before the
  // markdown content has rendered. Note that the third party attachment
  // request is run in parallel with the markdown rendering.
  const [isContentLoadCompleted, setIsContentLoadCompleted] = useState(false);
  const isFirstRendering = React.useRef(true);
  // Note that it is not possibile for a message to have both medical
  // prescription attachments and third party data. That is why, later in the
  // code, the UI rendering is guarded by opposite checks on prescription and
  // third party attachments
  const { prescriptionAttachments, markdown, prescriptionData } =
    messageDetails;
  const isPrescription = prescriptionData !== undefined;

  const messageId = message.id;
  const hasThirdPartyDataAttachments =
    messageDetails.hasThirdPartyDataAttachments;
  const thirdPartyDataPot = useIOSelector(state =>
    thirdPartyFromIdSelector(state, messageId)
  );
  // Third party attachments are retrieved from the third party service upon
  // first rendering of this component. We want to send the request only if
  // we have never retrieved data or if there was an error
  const shouldDownloadThirdPartyDataAttachmentList =
    hasThirdPartyDataAttachments &&
    isFirstRendering.current &&
    (isStrictNone(thirdPartyDataPot) || pot.isError(thirdPartyDataPot));

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
      const thirdPartyMessageAttachmentsOption =
        attachmentsFromThirdPartyMessage(thirdPartyMessage, "GENERIC");
      return O.isSome(thirdPartyMessageAttachmentsOption) ? (
        <View style={styles.padded}>
          <MessageAttachments
            attachments={thirdPartyMessageAttachmentsOption.value}
            openPreview={openAttachment}
          />
        </View>
      ) : (
        renderThirdPartyAttachmentsError(viewRef)
      );
    },
    [openAttachment, viewRef]
  );

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isFirstRendering.current = false;
    // Third party attachments, if available, are downloaded upon
    // first rendering of this component
    if (shouldDownloadThirdPartyDataAttachmentList) {
      dispatch(loadThirdPartyMessage.request(messageId));
    }
  }, [dispatch, messageId, shouldDownloadThirdPartyDataAttachmentList]);

  return (
    <>
      <NBContent noPadded={true}>
        <View style={styles.padded}>
          <VSpacer size={24} />

          {service && <OrganizationTitle {...service} />}

          <VSpacer size={24} />

          <MessageTitle title={message.title} isPrescription={isPrescription} />

          <VSpacer size={16} />
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
          {cleanMarkdownFromCTAs(markdown)}
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
              _ => renderThirdPartyAttachmentsError(viewRef),
              thirdPartyMessage =>
                renderThirdPartyAttachments(thirdPartyMessage),
              _ => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsError(viewRef)
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
      </NBContent>

      <>
        {/* This space is rendered as extra space on the iPhone 14 Pro.
        Not present on the iPhone 13 because `hasNotch` returns false value
        caused by a bug. */}
        {/* {DeviceInfo.hasNotch() && <VSpacer size={32} />} */}

        <CtaBar
          isPaid={hasPaidBadge}
          messageDetails={messageDetails}
          service={service}
          serviceMetadata={serviceMetadata}
        />
      </>
    </>
  );
};

export default MessageDetailsComponent;
